const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const sendEmail = require("../../utils/emailUtility");
const config = require("../../config").get(process.env.ENV);
const { generateInvoice, convertHtmlToPdfBuffer } = require("./../../utils/generateInvoice");
const { uploadBuffer, createSignedUrl } = require("../../utils/supabaseStorage");
const {
  runMysqlQuery,
  runMysqlQueryWithParam,
  mysqlConnect,
  beginTransaction,
  commit,
  runTransectionQuery,
  rollback,
} = require("../../config/mysqlConfig");

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function normalizeUnit(unit) {
  const normalized = `${unit || ""}`.trim().toLowerCase();
  if (["piece", "pieces", "piece(s)"].includes(normalized)) return "piece(s)";
  if (["plate", "plates", "plate(s)"].includes(normalized)) return "plate(s)";
  return normalized;
}

function buildReceiptUrl(orderId) {
  return `/uploads/invoices/${Number(orderId) + 1000}_invoice.pdf`;
}

const ORDER_STATUS = {
  PROCESSING: 1,
  COMPLETED: 2,
  CANCELED: 3,
};

const DELIVERY_STATUS = {
  PROCESSING: 1,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
  CANCELED: 4,
};

function isFutureDeliveryDate(deliveryDate) {
  const value = `${deliveryDate || ""}`.trim();
  if (!value) return false;
  const parsed = moment(value, ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
  return parsed.isValid() && parsed.startOf("day").isAfter(moment().startOf("day"));
}

function getOrderStatusFromItems(items) {
  if (items.every((item) => Number(item.delivery_status) === DELIVERY_STATUS.CANCELED)) {
    return ORDER_STATUS.CANCELED;
  }
  if (
    items.every((item) =>
      [DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.CANCELED].includes(Number(item.delivery_status))
    )
  ) {
    return ORDER_STATUS.COMPLETED;
  }
  return ORDER_STATUS.PROCESSING;
}

function attachReceiptUrls(orders) {
  return orders.map((order) => ({
    ...order,
    receipt_url: buildReceiptUrl(order.id),
  }));
}

function validateCartForPincode(cartInfo, pincode) {
  const unavailableNames = [];
  const normalizedPincode = `${pincode || ""}`.trim();

  cartInfo.forEach((item) => {
    const name = item.name || "Item";
    const franchiseZipCodes = parseJsonArray(item.franchise_zip_codes).map((pin) => `${pin}`.trim());
    const priceRows = parseJsonArray(item.quantity_wise_price);
    const matchingPrice = priceRows.find((priceRow) => {
      return (
        Number(priceRow.quantity) === Number(item.quantity) &&
        normalizeUnit(priceRow.unit) === normalizeUnit(item.unit) &&
        Number(priceRow.price) === Number(item.price)
      );
    });
    const hasTrackedStock = matchingPrice && matchingPrice.stock_count !== undefined && matchingPrice.stock_count !== null && `${matchingPrice.stock_count}` !== "";
    const stockCount = hasTrackedStock ? Number(matchingPrice.stock_count) : null;

    if (
      Number(item.product_status) !== 1 ||
      Number(item.is_available) !== 1 ||
      !franchiseZipCodes.includes(normalizedPincode) ||
      !matchingPrice ||
      (hasTrackedStock && (!Number.isFinite(stockCount) || stockCount < Number(item.count)))
    ) {
      unavailableNames.push(name);
    }
  });

  return [...new Set(unavailableNames)];
}

function validateSingleDeliveryDate(cartInfo, deliveryDates) {
  const selectedDates = cartInfo
    .map((item) => deliveryDates?.[item.productId])
    .map((date) => `${date || ""}`.trim())
    .filter(Boolean);

  return selectedDates.length === cartInfo.length && new Set(selectedDates).size === 1;
}

async function updateStockAfterOrder(connection, cartInfo) {
  const groupedItems = cartInfo.reduce((groups, item) => {
    const key = `${item.productId}-${item.franchiseId}`;
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});

  for (const items of Object.values(groupedItems)) {
    const firstItem = items[0];
    let updatedPriceRows = parseJsonArray(firstItem.quantity_wise_price);
    let didTrackStock = false;

    items.forEach((item) => {
      updatedPriceRows = updatedPriceRows.map((priceRow) => {
        const isSelectedRow =
          Number(priceRow.quantity) === Number(item.quantity) &&
          normalizeUnit(priceRow.unit) === normalizeUnit(item.unit) &&
          Number(priceRow.price) === Number(item.price);
        const hasTrackedStock = priceRow.stock_count !== undefined && priceRow.stock_count !== null && `${priceRow.stock_count}` !== "";

        if (!isSelectedRow || !hasTrackedStock) return priceRow;

        didTrackStock = true;
        const nextStock = Math.max(0, Number(priceRow.stock_count) - Number(item.count));
        return { ...priceRow, stock_count: nextStock };
      });
    });

    if (!didTrackStock) continue;

    const allTrackedRowsSoldOut = updatedPriceRows.length > 0 && updatedPriceRows.every((priceRow) => {
      const hasTrackedStock = priceRow.stock_count !== undefined && priceRow.stock_count !== null && `${priceRow.stock_count}` !== "";
      return hasTrackedStock && Number(priceRow.stock_count) <= 0;
    });

    await runTransectionQuery(
      connection,
      "UPDATE tbl_product_price SET quantity_wise_price=?, is_available=? WHERE product_id=? AND user_id=?",
      [JSON.stringify(updatedPriceRows), allTrackedRowsSoldOut ? 0 : 1, firstItem.productId, firstItem.franchiseId]
    );
  }
}

const addOrderDetails = async (formData, cartId, deliveryDates, existingUserId, isPincodeChanged, shipping_cost) => {
  try {
    const cartSql = `SELECT p.name, p.images, p.status AS product_status, c.cartId, c.userId, c.productId, c.franchiseId, c.quantity, c.unit, c.price, c.shippingCost, c.count, pp.is_available, u.status,
                      IFNULL(pp.quantity_wise_price, null) as quantity_wise_price,
                      f.zip_codes AS franchise_zip_codes
                      FROM tbl_cart c 
                      LEFT JOIN tbl_products p 
                      ON c.productId = p.id 
                      LEFT JOIN tbl_product_price pp
                      ON c.productId = pp.product_id
                      LEFT JOIN tbl_users u
                      ON u.id=c.franchiseId
                      LEFT JOIN tbl_franchise_details f
                      ON f.user_id=c.franchiseId
                      WHERE c.cartId=? AND c.franchiseId = pp.user_id`;
    const cartInfo = await runMysqlQueryWithParam(cartSql, [cartId]);
    if (!cartInfo.length) return { status: false, msg: "Unable to place order. Check cart details", responseObj: {} };
    if (cartInfo.length && (cartInfo[0].status == 3 || cartInfo[0].status == 4))
      return { status: false, msg: "Unable to place order. The franchise is not available at the moment", responseObj: {} };

    const shippingSql = `select shipping_cost from tbl_shipping_cost where user_id=? and pin_code=?`;
    const originalShippingCostArr = await runMysqlQueryWithParam(shippingSql, [cartInfo[0].franchiseId, formData.pincode]);
    let originalShipping = 0;
    if (originalShippingCostArr.length) {
      originalShipping = originalShippingCostArr[0].shipping_cost;
    }

    const unavailableNames = validateCartForPincode(cartInfo, formData.pincode);
    if (unavailableNames.length) {
      return {
        status: false,
        msg: "Few cart items are no longer available for this pincode. Please remove them and try again.",
        responseObj: unavailableNames,
      };
    }
    if (!validateSingleDeliveryDate(cartInfo, deliveryDates)) {
      return {
        status: false,
        msg: "Please select one delivery date for the whole order. Place separate orders for separate delivery dates.",
        responseObj: {},
      };
    }
    let subTotal = 0;
    let shipping = shipping_cost;
    const shipping_address = `${formData.street}, ${formData.district}, ${formData.state}, pin code - ${formData.pincode}`;
    const billing_address = `${formData.street}, ${formData.district}, ${formData.state}, pin code - ${formData.pincode}`;
    cartInfo.forEach((item) => {
      subTotal += item.price * item.count;
    });
    const totalPrice = subTotal + shipping;
    const connection = await mysqlConnect();
    try {
      let order;
      let userId = null;
      const orderArr = [
        cartInfo[0].franchiseId,
        totalPrice,
        shipping_address,
        billing_address,
        formData.name,
        formData.state,
        formData.district,
        formData.additionalNote,
        JSON.stringify(deliveryDates),
        formData.phone,
        formData.pincode,
        formData.landmark,
        shipping,
      ];
      const userDataArr = [formData.street, formData.district, formData.state, formData.landmark, formData.pincode];

      let userCheck = [];
      if (existingUserId) {
        userId = existingUserId;
        const usercheckSql = `SELECT u.id,u.email,u.phone_number,u.name,u.status,ud.pin_code FROM tbl_users u LEFT JOIN tbl_user_details ud ON u.id=ud.user_id WHERE u.id=?`;
        userCheck = await runMysqlQueryWithParam(usercheckSql, [userId]);
        if (!userCheck.length) {
          return { status: false, msg: "Unable to place order. Please login again.", responseObj: {} };
        }
      }
      await beginTransaction(connection);
      if (existingUserId && userCheck.length) {
        let orderSql = `INSERT INTO tbl_orders 
                    (user_id, franchise_id, total_price, shipping_address, billing_address, name, state, district, additional_notes,delivery_date, phone_number, pin_code, landmark, shipping_cost)
                    VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        userId = userCheck[0].id;
        order = await runTransectionQuery(connection, orderSql, [userId, ...orderArr]);
        let userDataSql = "";
        let userParams = [];
        console.log("userCheck[0].pin_code = ", userCheck[0].pin_code);
        console.log("formData.pincode = ", formData.pincode);
        if (!userCheck[0].pin_code) {
          userDataSql = `UPDATE tbl_user_details SET street=?, district=?, state=?, landmark=?, pin_code=? WHERE user_id=?`;
          userParams = [...userDataArr, userId];
          const updateResult = await runTransectionQuery(connection, userDataSql, userParams);
          if (!updateResult.affectedRows) {
            userDataSql = `INSERT INTO tbl_user_details (user_id, street, district, state, landmark, pin_code) VALUES (?,?,?,?,?,?)`;
            userParams = [userId, ...userDataArr];
            await runTransectionQuery(connection, userDataSql, userParams);
          }
        }
        if (userCheck[0].pin_code && userCheck[0].pin_code != formData.pincode) {
          userDataSql = `UPDATE tbl_user_details SET street=?, district=?, state=?, landmark=?, pin_code=? WHERE user_id=?`;
          userParams = [...userDataArr, userId];
          await runTransectionQuery(connection, userDataSql, userParams);
        }
      } else {
        userId = 0;
        let orderSql = `INSERT INTO tbl_orders 
                    (user_id, franchise_id, total_price, shipping_address, billing_address, name, state, district, additional_notes,delivery_date, phone_number, pin_code, landmark, shipping_cost)
                    VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        order = await runTransectionQuery(connection, orderSql, [userId, ...orderArr]);
      }

      let orderId = Number(order.insertId);
      let refId = 1000 + orderId;
      let refSql = `UPDATE tbl_orders SET ref_no=? WHERE id=?`;
      await runTransectionQuery(connection, refSql, [`JB${refId}`, orderId]);
      const detailsSql = "INSERT INTO tbl_order_details (order_id, product_id, quantity, price, unit, count, delivery_date, shipping_cost) VALUES ?";
      const values = cartInfo.map((item) => [
        orderId,
        item.productId,
        item.quantity,
        item.price,
        normalizeUnit(item.unit),
        item.count,
        deliveryDates[item.productId] || "",
        originalShipping,
      ]);
      await runTransectionQuery(connection, detailsSql, [values]);
      await updateStockAfterOrder(connection, cartInfo);
      const receipt = await createOrderReceipt(connection, orderArr, cartInfo, orderId, formData.email, deliveryDates);

      let user = {};
      console.log("userCheck = ", userCheck);
      console.log("existingUserId = ", existingUserId);
      if (existingUserId && userCheck[0].pin_code != formData.pincode) {
        user = {
          street: formData.street,
          district: formData.district,
          state: formData.state,
          landmark: formData.landmark,
          pin_code: formData.pincode,
        };
        const updateAddressSql = `update tbl_user_details set street=?, district=?, state=?, landmark=?, pin_code=? where user_id=?`;
        await runTransectionQuery(connection, updateAddressSql, [
          formData.street,
          formData.district,
          formData.state,
          formData.landmark,
          formData.pincode,
          existingUserId,
        ]);
      }

      await runTransectionQuery(connection, "DELETE FROM tbl_cart WHERE cartId=?", [cartId]);
      await commit(connection);
      let emailSent = false;
      try {
        await sendOrderMail(formData.email, orderId, receipt);
        emailSent = true;
      } catch (e) {
        console.log("Order receipt email failed:", e);
      }
      return {
        status: true,
        msg: "Order placed successfully",
        responseObj: {
          refId,
          user,
          receipt: {
            fileName: receipt.fileName,
            storagePath: receipt.storagePath,
            publicUrl: receipt.publicUrl,
            emailSent,
          },
        },
      };
    } catch (e) {
      console.log("ERROR1 = ", e);
      await rollback(connection);
      return { status: false, msg: "Unable to place order. Please try again.", responseObj: {} };
    } finally {
      console.log("came in connection release");
      connection.release();
    }
  } catch (e) {
    console.log("ERROR2 = ", e);
    return { status: false, msg: "Unable to place order. Please try again.", responseObj: {} };
  }
};

function generatePassword() {
  var length = 6,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

const getOrderList = async (refId, user_id, role_id, pid) => {
  try {
    if (role_id !== 4) return { status: false, msg: "User is not authorized. Please login again", responseObj: [] };
    let whereClause = `WHERE o.user_id=?`;
    let params = [user_id];
    if (refId) {
      whereClause = `WHERE o.user_id=? AND o.id=?`;
      params = [user_id, refId - 1000];
    }
    if (pid) {
      whereClause = `WHERE o.user_id=? AND o.id=?`;
      params = [user_id, pid];
    }

    console.log("PARAMS = ", params);
    const sql = `SELECT o.*, u.email FROM tbl_orders o LEFT JOIN tbl_users u ON o.user_id=u.id ${whereClause} ORDER BY o.id DESC`;
    const orders = await runMysqlQueryWithParam(sql, params);
    console.log("sql = ", sql);
    console.log("orders = ", orders);
    const orderList = [];
    if (orders.length) {
      const orderIds = orders.map((item) => {
        console.log("ITEM = ", item);
        return item.id;
      });
      const orderIdsString = orderIds.join(",");
      const listSql = `SELECT o.*, p.name, p.images FROM tbl_order_details as o LEFT JOIN tbl_products p ON o.product_id=p.id WHERE o.order_id IN (${orderIdsString})`;
      const list = await runMysqlQuery(listSql);
      console.log("listSql = ", listSql);
      console.log("list = ", list);
      orders.forEach((item) => {
        const products = list.filter((o) => o.order_id === item.id);
        orderList.push({ ...item, itemList: products });
      });
    }
    return { status: true, msg: "order list fetched successfully", responseObj: attachReceiptUrls(orderList) };
  } catch (e) {
    return { status: false, msg: "Unable to fetch order list. Please try again", responseObj: [] };
  }
};

const addReview = async (stars, review, pid, user_id, role_id) => {
  try {
    const checkSql = `SELECT id FROM tbl_product_review WHERE user_id=? AND product_id=?`;
    const check = await runMysqlQueryWithParam(checkSql, [user_id, pid]);
    if (check.length) return { status: false, msg: "Review already added for this product", responseObj: [] };
    const sql = `INSERT INTO tbl_product_review (product_id, user_id, message, stars) VALUES (?, ?, ?, ?)`;
    await runMysqlQueryWithParam(sql, [pid, user_id, review, stars]);
    const listSql = `SELECT pr.*, p.name FROM tbl_product_review pr LEFT JOIN tbl_products p ON pr.product_id=p.id WHERE pr.user_id=?`;
    const list = await runMysqlQueryWithParam(listSql, [user_id]);
    return { status: true, msg: "review added successfully", responseObj: list };
  } catch (e) {
    return { status: false, msg: "Unable to add review. Please try again", responseObj: [] };
  }
};

const getReviewList = async (user_id) => {
  try {
    const sql = `SELECT pr.*, p.name FROM tbl_product_review pr LEFT JOIN tbl_products p ON pr.product_id=p.id WHERE pr.user_id=?`;
    const list = await runMysqlQueryWithParam(sql, [user_id]);
    return { status: true, msg: "review fetched successfully", responseObj: list };
  } catch (e) {
    console.log("error = ", e);
    return { status: false, msg: "Unable to load review. Please try again", responseObj: [] };
  }
};

const deleteReview = async (id, user_id) => {
  try {
    const delSql = `DELETE FROM tbl_product_review WHERE id=?`;
    await runMysqlQueryWithParam(delSql, id);
    const sql = `SELECT pr.*, p.name FROM tbl_product_review pr LEFT JOIN tbl_products p ON pr.product_id=p.id WHERE pr.user_id=?`;
    const list = await runMysqlQueryWithParam(sql, [user_id]);
    return { status: true, msg: "review fetched successfully", responseObj: list };
  } catch (e) {
    console.log("error = ", e);
    return { status: false, msg: "Unable to delete review. Please try again", responseObj: [] };
  }
};

const getOrderItemOnId = async (refId) => {
  try {
    if (!refId) {
      return { status: false, msg: "Unable to fetch order item. Please try again", responseObj: [] };
    }
    let whereClause = `WHERE o.ref_no=?`;
    let params = [`JB${refId}`];
    console.log("PARAMS = ", params);
    const sql = `SELECT o.*, u.email FROM tbl_orders o LEFT JOIN tbl_users u ON o.user_id=u.id ${whereClause} ORDER BY o.id DESC`;
    const orders = await runMysqlQueryWithParam(sql, params);
    const orderList = [];
    if (orders.length) {
      const orderIds = orders.map((item) => {
        console.log("ITEM = ", item);
        return item.id;
      });
      const orderIdsString = orderIds.join(",");
      const listSql = `SELECT o.*, p.name, p.images FROM tbl_order_details as o LEFT JOIN tbl_products p ON o.product_id=p.id WHERE o.order_id IN (${orderIdsString})`;
      const list = await runMysqlQuery(listSql);
      orders.forEach((item) => {
        const products = list.filter((o) => o.order_id === item.id);
        orderList.push({ ...item, itemList: products });
      });
    }
    return { status: true, msg: "order list fetched successfully", responseObj: attachReceiptUrls(orderList) };
  } catch (e) {
    return { status: false, msg: "Unable to fetch order list. Please try again", responseObj: [] };
  }
};

const cancelFutureOrder = async (orderId, user_id, role_id) => {
  try {
    if (role_id !== 4) {
      return { status: false, msg: "User is not authorized. Please login again", responseObj: {} };
    }

    const normalizedOrderId = Number(orderId);
    if (!normalizedOrderId) {
      return { status: false, msg: "Unable to cancel order. Invalid order details.", responseObj: {} };
    }

    const orderSql = `SELECT id, user_id, shipping_cost FROM tbl_orders WHERE id=? AND user_id=?`;
    const orders = await runMysqlQueryWithParam(orderSql, [normalizedOrderId, user_id]);
    if (!orders.length) {
      return { status: false, msg: "Unable to cancel order. Order not found.", responseObj: {} };
    }

    const itemSql = `SELECT id, price, count, delivery_status, delivery_date FROM tbl_order_details WHERE order_id=?`;
    const items = await runMysqlQueryWithParam(itemSql, [normalizedOrderId]);
    const eligibleItems = items.filter((item) => {
      return (
        [DELIVERY_STATUS.PROCESSING, DELIVERY_STATUS.OUT_FOR_DELIVERY].includes(Number(item.delivery_status)) &&
        isFutureDeliveryDate(item.delivery_date)
      );
    });

    if (!eligibleItems.length) {
      return { status: false, msg: "Only future processing orders can be canceled.", responseObj: {} };
    }

    const connection = await mysqlConnect();
    try {
      await beginTransaction(connection);
      const eligibleIds = eligibleItems.map((item) => item.id);
      await runTransectionQuery(
        connection,
        `UPDATE tbl_order_details SET delivery_status=?, delivery_boy_id=NULL WHERE id IN (?)`,
        [DELIVERY_STATUS.CANCELED, eligibleIds]
      );

      const updatedItems = items.map((item) =>
        eligibleIds.includes(item.id) ? { ...item, delivery_status: DELIVERY_STATUS.CANCELED } : item
      );
      const activeItems = updatedItems.filter((item) => Number(item.delivery_status) !== DELIVERY_STATUS.CANCELED);
      const subTotal = activeItems.reduce((total, item) => total + Number(item.price) * Number(item.count), 0);
      const shippingCost = activeItems.length ? Number(orders[0].shipping_cost || 0) : 0;
      const nextStatus = getOrderStatusFromItems(updatedItems);

      await runTransectionQuery(
        connection,
        `UPDATE tbl_orders SET status=?, total_price=?, shipping_cost=? WHERE id=? AND user_id=?`,
        [nextStatus, subTotal + shippingCost, shippingCost, normalizedOrderId, user_id]
      );
      await commit(connection);
      return { status: true, msg: "Future order canceled successfully", responseObj: {} };
    } catch (e) {
      await rollback(connection);
      console.log(e);
      return { status: false, msg: "Unable to cancel order. Please try again.", responseObj: {} };
    } finally {
      connection.release();
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to cancel order. Please try again.", responseObj: {} };
  }
};

module.exports = { addOrderDetails, getOrderList, addReview, getReviewList, deleteReview, getOrderItemOnId, cancelFutureOrder };

function getOrderProductHtml(cartInfo, deliveryDates, list) {
  let html = "";
  list.forEach((item) => {
    const { name, quantity, price, unit, count, delivery_date } = item;
    html += `<tr>
    <td className="text-start">
      <a href="shop-details.html">${name}</a>
      <p className="mb-0">
        quantity: ${quantity}${unit} x ${count}
      </p>
    </td>
    <td className="text-end">${delivery_date}</td>
    <td className="text-end">₹${(Number(price) * Number(count)).toFixed(2)}</td>
  </tr>`;
  });

  return html;
}

async function createOrderReceipt(connection, orderArr, cartInfo, orderId, email, deliveryDates) {
  const listSql = `SELECT o.*, p.name FROM tbl_order_details as o LEFT JOIN tbl_products p ON o.product_id=p.id WHERE o.order_id=?`;
  const list = await runTransectionQuery(connection, listSql, [orderId]);
  const htmlInvoice = await generateInvoice(orderArr, cartInfo, orderId, deliveryDates, list);
  const pdfBuffer = await convertHtmlToPdfBuffer(htmlInvoice);
  const invoiceFileName = `${orderId + 1000}_invoice.pdf`;
  const storagePath = `invoices/${invoiceFileName}`;
  await uploadBuffer(pdfBuffer, storagePath, "application/pdf");

  return {
    fileName: invoiceFileName,
    storagePath,
    publicUrl: await createSignedUrl(storagePath),
    pdfBuffer,
  };
}

async function sendOrderMail(email, orderId, receipt) {
  const attachments = [
    {
      filename: receipt.fileName,
      content: receipt.pdfBuffer,
      contentType: "application/pdf",
    },
  ];
  const bodyHtml = `
    <p>
      Thank you! for your order. Your order is confirmed, below is your order reference number
    </p>
    <p>
    <p style="padding-top: 20px">Reference no. JB${orderId + 1000}</p>
    <p style="padding-top: 20px">We have attached the order invoice for your reference.</p>
  `;
  const subject = `Order Confirmed With Order Id-#JB${orderId + 1000}`;
  await sendEmail(email?.toLowerCase()?.trim(), subject, bodyHtml, attachments);
}
