const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const sendEmail = require("../../utils/emailUtility");
const config = require("../../config").get(process.env.ENV);
const { generateInvoice, convertHtmlToPdfBuffer } = require("./../../utils/generateInvoice");
const { uploadBuffer, getPublicUrl } = require("../../utils/supabaseStorage");
const {
  runMysqlQuery,
  runMysqlQueryWithParam,
  mysqlConnect,
  beginTransaction,
  commit,
  runTransectionQuery,
  rollback,
} = require("../../config/mysqlConfig");

const addOrderDetails = async (formData, cartId, deliveryDates, existingUserId, isPincodeChanged, shipping_cost) => {
  try {
    const cartSql = `SELECT p.name, p.images, c.cartId, c.userId, c.productId, c.franchiseId, c.quantity, c.unit, c.price, c.shippingCost, c.count, pp.is_available, u.status,
                      IFNULL(pp.quantity_wise_price, null) as quantity_wise_price
                      FROM tbl_cart c 
                      LEFT JOIN tbl_products p 
                      ON c.productId = p.id 
                      LEFT JOIN tbl_product_price pp
                      ON c.productId = pp.product_id
                      LEFT JOIN tbl_users u
                      ON u.id=c.franchiseId
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

    if (cartInfo.length) {
      const unavilableNames = [];
      cartInfo.forEach((obj) => {
        if (obj.is_available == 0) {
          unavilableNames.push(obj.name);
        }
      });

      if (unavilableNames.length) {
        return {
          status: false,
          msg: "Few of the items are not available. Please remove them from cart and place order again.",
          responseObj: unavilableNames,
        };
      }
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

      let userWhereClause = `WHERE u.email=? AND u.role_id=4`;
      if (existingUserId) {
        userId = existingUserId;
        userWhereClause = `WHERE u.id=?`;
      }
      const userParams = userId || formData?.email.trim().toLowerCase();
      const usercheckSql = `SELECT u.id,u.email,u.phone_number,u.name,u.status,ud.pin_code FROM tbl_users u LEFT JOIN tbl_user_details ud ON u.id=ud.user_id ${userWhereClause}`;
      const userCheck = await runMysqlQueryWithParam(usercheckSql, [userParams]);
      await beginTransaction(connection);
      if (userCheck.length) {
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
          userDataSql = `INSERT INTO tbl_user_details (user_id, street, district, state, landmark, pin_code) VALUES (?,?,?,?,?,?)`;
          userParams = [userId, ...userDataArr];
          await runTransectionQuery(connection, userDataSql, userParams);
        }
        if (userCheck[0].pin_code && userCheck[0].pin_code != formData.pincode) {
          userDataSql = `UPDATE tbl_user_details SET street=?, district=?, state=?, landmark=?, pin_code=? WHERE user_id=?`;
          userParams = [...userDataArr, userId];
          await runTransectionQuery(connection, userDataSql, userParams);
        }
      } else {
        const email = formData.email.trim().toLowerCase();
        const password = "test123"; //generatePassword();
        const hashedPassword = bcrypt.hashSync(password, config.saltRounds);
        const userSql = `INSERT INTO tbl_users (role_id, email, password, name, phone_number) VALUES (?,?,?,?,?)`;
        const userDataSql = `INSERT INTO tbl_user_details (user_id, street, district, state, landmark, pin_code) VALUES (?,?,?,?,?,?)`;
        const userInsert = await runTransectionQuery(connection, userSql, [4, email, hashedPassword, formData.name, formData.phone]);
        userId = userInsert.insertId;
        await runTransectionQuery(connection, userDataSql, [userId, ...userDataArr]);
        let orderSql = `INSERT INTO tbl_orders 
                    (user_id, franchise_id, total_price, shipping_address, billing_address, name, state, district, additional_notes,delivery_date, phone_number, pin_code, landmark, shipping_cost)
                    VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        order = await runTransectionQuery(connection, orderSql, [userId, ...orderArr]);
      }

      let orderId = order.insertId;
      let refId = 1000 + orderId;
      let refSql = `UPDATE tbl_orders SET ref_no=? WHERE id=?`;
      await runTransectionQuery(connection, refSql, [`JB${refId}`, orderId]);
      const detailsSql = "INSERT INTO tbl_order_details (order_id, product_id, quantity, price, unit, count, delivery_date, shipping_cost) VALUES ?";
      const values = cartInfo.map((item) => [
        orderId,
        item.productId,
        item.quantity,
        item.price,
        item.unit,
        item.count,
        deliveryDates[item.productId] || "",
        originalShipping,
      ]);
      await runTransectionQuery(connection, detailsSql, [values]);
      const receipt = await createOrderReceipt(connection, orderArr, cartInfo, orderId, formData.email, deliveryDates);

      let user = {};
      if (!existingUserId && !userCheck.length) {
        const token = jwt.sign({ id: userId, role_id: 4 }, config.jwt.secret, {
          expiresIn: config.jwt.token_life,
        });
        const refreshToken = jwt.sign({ id: userId, role_id: 4 }, config.jwt.refresh_secret, {
          expiresIn: config.jwt.refresh_token_life,
        });
        user = {
          id: userId,
          email: formData.email.trim().toLowerCase(),
          name: formData.name,
          phone_number: formData.phone,
          status: 1,
          token,
          refreshToken,
          street: formData.street,
          district: formData.district,
          state: formData.state,
          landmark: formData.landmark,
          pin_code: formData.pincode,
        };
      }
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
    return { status: true, msg: "order list fetched successfully", responseObj: orderList };
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
    return { status: true, msg: "order list fetched successfully", responseObj: orderList };
  } catch (e) {
    return { status: false, msg: "Unable to fetch order list. Please try again", responseObj: [] };
  }
};

module.exports = { addOrderDetails, getOrderList, addReview, getReviewList, deleteReview, getOrderItemOnId };

function getOrderProductHtml(cartInfo, deliveryDates, list) {
  let html = "";
  list.forEach((item) => {
    const { name, quantity, price, unit, count, delivery_date } = item;
    html += `<tr>
    <td className="text-start">
      <a href="shop-details.html">${name}</a>
      <p className="mb-0">
        weight: ${quantity}${unit} x ${count}
      </p>
    </td>
    <td className="text-end">${delivery_date}</td>
    <td className="text-end">₹${price * count.toFixed(2)}</td>
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
    publicUrl: getPublicUrl(storagePath),
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
