const {
  runMysqlQuery,
  runMysqlQueryWithParam,
  mysqlConnect,
  beginTransaction,
  commit,
  runTransectionQuery,
  rollback,
} = require("../../config/mysqlConfig");

const getAllOrders = async (user_id, role_id) => {
  try {
    if (role_id === 1 || role_id === 2) {
      let whereClause = ``;
      let params = [];
      if (role_id === 2) {
        whereClause = `Where o.franchise_id=?`;
        params = [user_id];
      }
      const sql = `SELECT 
            o.id,
            o.ref_no,
            o.franchise_id,
            o.delevery_boy_id,
            o.total_price,
            o.status,
            o.shipping_address,
            o.landmark,
            o.inserted_at,
            o.phone_number,
            o.name,
            o.shipping_cost,
            o.additional_notes,
            c.email,
            (select franchise_name from tbl_franchise_details where user_id=o.franchise_id) as franchise_name,
            STRING_AGG(p.name::text, ',') AS product_names,
            STRING_AGG(od.quantity::text, ',') AS quantity,
            STRING_AGG(od.price::text, ',') AS price,
            STRING_AGG(od.unit::text, ',') AS units,
            STRING_AGG(od.count::text, ',') AS counts,
            STRING_AGG(od.delivery_status::text, ',') AS delivery_status,
            STRING_AGG(od.delivery_date::text, ',') AS delivery_date
        FROM tbl_orders o
        INNER JOIN tbl_franchise_details f ON o.franchise_id = f.user_id
        INNER JOIN tbl_users c ON o.user_id = c.id
        INNER JOIN tbl_order_details od ON o.id = od.order_id
        INNER JOIN tbl_products p ON od.product_id = p.id 
       
        ${whereClause} 
        GROUP BY o.id, c.email
        ORDER BY o.inserted_at DESC;`;
      const list = await runMysqlQueryWithParam(sql, params);
      return { status: true, msg: "Order list fetched successfully", responseObj: list };
    } else {
      return { status: false, msg: "User Not Authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again" };
  }
};

const getAllOrdersByFranchise = async (user_id, role_id, franchiseId) => {
  try {
    if (role_id === 1 || role_id === 2) {
      let whereClause = ``;

      let params = [];
      if (franchiseId) {
        whereClause = `Where o.franchise_id=?`;
        params = [franchiseId];
      }
      if (role_id === 2) {
        whereClause = `Where o.franchise_id=?`;
        params = [user_id];
      }
      const sql = `SELECT 
            o.id,
            o.ref_no,
            o.franchise_id,
            o.delevery_boy_id,
            o.total_price,
            o.status,
            o.shipping_address,
            o.landmark,
            o.inserted_at,
            o.phone_number,
            o.name,
            o.shipping_cost,
            c.email,
            (select franchise_name from tbl_franchise_details where user_id=o.franchise_id) as franchise_name,
            STRING_AGG(p.name::text, ',') AS product_names,
            STRING_AGG(od.quantity::text, ',') AS quantity,
            STRING_AGG(od.price::text, ',') AS price,
            STRING_AGG(od.unit::text, ',') AS units,
            STRING_AGG(od.count::text, ',') AS counts,
            STRING_AGG(od.delivery_status::text, ',') AS delivery_status,
            STRING_AGG(od.delivery_date::text, ',') AS delivery_date
        FROM tbl_orders o
        INNER JOIN tbl_franchise_details f ON o.franchise_id = f.user_id
        INNER JOIN tbl_users c ON o.user_id = c.id
        INNER JOIN tbl_order_details od ON o.id = od.order_id
        INNER JOIN tbl_products p ON od.product_id = p.id 
       
        ${whereClause} 
        GROUP BY o.id, c.email
        ORDER BY o.inserted_at DESC;`;
      const list = await runMysqlQueryWithParam(sql, params);
      return { status: true, msg: "Order list fetched successfully", responseObj: list };
    } else {
      return { status: false, msg: "User Not Authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again" };
  }
};

const getDeleveryboyListOnFranchise = async (user_id, role_id, franchiseId) => {
  try {
    if (role_id !== 1 && role_id !== 2) return { status: false, msg: "User Not Authorized" };
    console.log("heloooooooo");
    const sql = `SELECT u.id, u.email, u.phone_number, u.name, COUNT(o.delevery_boy_id) AS count
                  FROM tbl_users u
                  LEFT JOIN tbl_delevery_boy_details d ON u.id=d.user_id
                  LEFT JOIN tbl_orders o ON o.delevery_boy_id=d.user_id
                  WHERE d.franchise_id=? AND u.status=1
                  GROUP BY u.id, u.email, u.phone_number, u.name`;
    const list = await runMysqlQueryWithParam(sql, [franchiseId]);
    return { status: true, msg: "delevery boy list fetched successfully on franchise", responseObj: list };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again" };
  }
};

const validateUpdatingOrder = async (data) => {
  const { role_id, user_id, deleveryboyId, status, orderId } = data;
  try {
    let check = [];
    if (role_id !== 1 && role_id !== 2) return { status: false, msg: "User Not Authorized" };
    if (role_id === 2) {
      const sql = `SELECT o.franchise_id 
                 FROM tbl_orders o 
                 LEFT JOIN tbl_delevery_boy_details d
                 ON o.franchise_id=d.franchise_id WHERE o.id=? AND o.franchise_id=? AND d.user_id=?`;
      check = await runMysqlQueryWithParam(sql, [orderId, user_id, deleveryboyId]);
    } else if (role_id === 1) {
      const sqlAdmin = `SELECT o.franchise_id 
                  FROM tbl_orders o 
                  WHERE o.id=?`;
      check = await runMysqlQueryWithParam(sqlAdmin, [orderId]);
    } else {
    }

    if (check.length) {
      return { status: true, msg: "" };
    } else {
      return { status: false, msg: "User Not Authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const updateDeleveryboyWithStatus = async ({ deleveryboyId, status, orderId }) => {
  try {
    const sql = `UPDATE tbl_orders SET delevery_boy_id=?, status=? WHERE id=?`;
    const update = await runMysqlQueryWithParam(sql, [deleveryboyId, status, orderId]);
    return { status: true, msg: "Order updated successfully" };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const getOrderOnID = async (user_id, role_id, id) => {
  try {
    if (role_id === 1 || role_id === 2 || role_id === 3) {
      let whereClause = `where o.id=?`;
      let params = [id];
      if (role_id === 2) {
        whereClause = `where o.id=? and o.franchise_id=?`;
        params = [id, user_id];
      }
      const sql = `select o.*, c.email from tbl_orders o left join tbl_users c on c.id=o.user_id ${whereClause}`;
      const orders = await runMysqlQueryWithParam(sql, params);
      let orderList = {};
      if (orders.length) {
        const listSql = `SELECT o.*,pp.delevery_days, p.name FROM tbl_order_details as o left join tbl_product_price pp on pp.product_id=o.product_id and pp.user_id=${orders[0].franchise_id} LEFT JOIN tbl_products p ON o.product_id=p.id WHERE o.order_id=?`;
        const list = await runMysqlQueryWithParam(listSql, [orders[0].id]);
        orderList = { ...orders[0], itemList: list };
      }
      return { status: true, msg: "Order details fetched successfully", responseObj: orderList };
    } else {
      return { status: false, msg: "User not authorized." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const updateOrderDeliveryStatus = async (user_id, role_id, id, status) => {
  try {
    if (role_id === 1 || role_id === 2 || role_id === 3) {
      if (role_id === 2) {
        const checkSql = `select o.franchise_id from tbl_order_details od left join tbl_orders o where od.order_id=o.id where od.id=? and o.franchise_id=?`;
        const check = await runMysqlQueryWithParam(checkSql, [id, user_id]);

        if (check.length) {
          const orderListSql = `select id, delivery_status from tbl_order_details where order_id=?`;
          const itemList = await runMysqlQueryWithParam(orderListSql, [check[0].order_id]);
          const sql = `update tbl_order_details set delivery_status=? where id=?`;
          await runMysqlQueryWithParam(sql, [status, id]);
          let isMainOrderComplete = true;
          if (itemList.length) {
            itemList.map((item) => {
              if (item.id != id && (item.delivery_status != 3 || item.delivery_status != 4)) {
                isMainOrderComplete = false;
              }
            });
          }
          console.log("isMainOrderComplete = ", isMainOrderComplete);
          if (isMainOrderComplete) {
            await runMysqlQueryWithParam(`update tbl_orders set status=2 where id=?`, [check[0].order_id]);
          }
          return { status: true, msg: "Order status updated successfully", responseObj: {} };
        } else {
          return { status: false, msg: "User not authorized to update." };
        }
      } else {
        const checkSql = `select order_id from tbl_order_details where id=?`;
        const check = await runMysqlQueryWithParam(checkSql, [id]);
        const orderListSql = `select id, delivery_status from tbl_order_details where order_id=?`;
        const itemList = await runMysqlQueryWithParam(orderListSql, [check[0].order_id]);
        const sql = `update tbl_order_details set delivery_status=? where id=?`;
        await runMysqlQueryWithParam(sql, [status, id]);
        let isMainOrderComplete = true;
        if (itemList.length) {
          itemList.map((item) => {
            if (item.id != id && (item.delivery_status != 3 || item.delivery_status != 4)) {
              isMainOrderComplete = false;
            }
          });
        }
        console.log("isMainOrderComplete = ", isMainOrderComplete);
        if (isMainOrderComplete) {
          await runMysqlQueryWithParam(`update tbl_orders set status=2 where id=?`, [check[0].order_id]);
        }
        let obj = {};
        return { status: true, msg: "Order status updated successfully", responseObj: obj };
      }
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const getFranchiseListOnOrder = async (user_id, role_id, orderId) => {
  try {
    if (role_id === 1 || role_id === 2) {
      let whereClause = `WHERE od.id=?`;
      let params = [orderId];
      if (role_id === 2) {
        whereClause = `WHERE od.id=? and od.franchise_id=?`;
        params = [orderId, user_id];
      }
      const sql = `SELECT u.id, u.email, u.phone_number, u.name, COUNT(o.delevery_boy_id) AS count, d.district
      FROM tbl_users u
      LEFT JOIN tbl_delevery_boy_details d ON u.id=d.user_id
      LEFT JOIN tbl_orders o ON o.delevery_boy_id=d.user_id
      LEFT JOIN tbl_orders od ON od.franchise_id=d.franchise_id
      ${whereClause} AND u.status=1
      GROUP BY u.id, u.email, u.phone_number, u.name, d.district`;
      const list = await runMysqlQueryWithParam(sql, params);
      return { status: true, msg: "Order status updated successfully", responseObj: list };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const updateDeliveryBoyOnOrder = async (user_id, role_id, boyId, orderId, orderDetailsId) => {
  try {
    if (role_id === 1 || role_id === 2) {
      const statusSql = `update tbl_order_details set delivery_status=2, delivery_boy_id=? where id=?`;
      await runMysqlQueryWithParam(statusSql, [boyId ? boyId : null, orderDetailsId]);
      let obj = {};
      return { status: true, msg: "Order item Delivery boy updated successfully", responseObj: obj };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const cancelOrder = async (user_id, role_id, id) => {
  try {
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2) {
        const checkSql = `select franchise_id from tbl_orders where id=?`;
        const check = await runMysqlQueryWithParam(checkSql, [id]);
        if (check.length && check[0].franchiseId !== user_id) {
          return { status: false, msg: "User not authorized to update." };
        }
      }
      const sql = `update tbl_orders set status=3 where id=?`;
      const detailSql = `update tbl_order_details set delivery_status=4, delivery_boy_id=NULL where order_id=?`;
      await runMysqlQueryWithParam(sql, [id]);
      await runMysqlQueryWithParam(detailSql, [id]);
      return { status: true, msg: "Order canceled successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const cancelOrderItems = async (user_id, role_id, orderIds) => {
  try {
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2) {
        const checkSql = `select franchise_id from tbl_orders where id in (?) and franchise_id!=?`;
        const check = await runMysqlQueryWithParam(checkSql, [orderIds, user_id]);
        if (check.length) {
          return { status: false, msg: "User not authorized to cancel few of the orders." };
        }
      }
      const sql = `update tbl_orders set status=3 where id in (?)`;
      const detailSql = `update tbl_order_details set delivery_status=4, delivery_boy_id=NULL where order_id in (?)`;
      await runMysqlQueryWithParam(sql, [orderIds]);
      await runMysqlQueryWithParam(detailSql, [orderIds]);
      return { status: true, msg: "Orders canceled successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const cancelOrderOnItemId = async (user_id, role_id, orderId, itemId, mainOrderCancel) => {
  console.log("INNNNNN = ", orderId, itemId, mainOrderCancel);
  try {
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2) {
        const checkSql = `select franchise_id from tbl_orders where id=? and franchise_id!=?`;
        const check = await runMysqlQueryWithParam(checkSql, [orderId, user_id]);
        if (check.length) {
          return { status: false, msg: "User not authorized to cancel the order item." };
        }
      }

      let itemListSql = `select od.id, o.franchise_id, od.price, od.count, od.delivery_status, o.shipping_cost, od.shipping_cost as original_shipping, od.delivery_date from tbl_order_details od left join tbl_orders o on od.order_id=o.id where od.order_id=?`;
      let itemList = await runMysqlQueryWithParam(itemListSql, [orderId]);
      console.log("itemList = ", itemList);

      let totalPrice = 0;
      let isDifferentDate = false;
      let delivery_date = null;
      let itemDeliveryDate = null;
      let itemShippingCost = 0;
      let shipping = itemList[0].shipping_cost;

      itemList.forEach((obj) => {
        if (obj.id == itemId) {
          itemShippingCost = obj.original_shipping ? obj.original_shipping : 0;
          itemDeliveryDate = obj.delivery_date;
        }
        if (obj.id != itemId) {
          delivery_date = obj.delivery_date;
          totalPrice = totalPrice + obj.price * obj.count;
        }
      });
      if (totalPrice != 0) totalPrice = totalPrice + itemList[0].shipping_cost;
      if (delivery_date != itemDeliveryDate && itemList.length > 1) {
        shipping = parseFloat(shipping) - parseFloat(itemShippingCost);
        if (shipping >= 0) {
          totalPrice = totalPrice - shipping;
        }
      }
      let mainCancel = true;
      if (itemList.length > 1) {
        mainCancel = itemList.some((obj) => obj.id != itemId && obj.delivery_status != 4);
      }

      // console.log("totalPrice = ", totalPrice);
      console.log("mainCancel = ", mainCancel);
      // return;

      if (!mainCancel) {
        let sql = `update tbl_orders set status=3, shipping_cost=0, total_price=0 where id=?`;
        await runMysqlQueryWithParam(sql, [orderId]);
      } else {
        let sql = `update tbl_orders set total_price=?, shipping_cost=? where id=?`;
        await runMysqlQueryWithParam(sql, [totalPrice, shipping, orderId]);
      }
      const detailSql = `update tbl_order_details set delivery_status=4, delivery_boy_id=NULL where id=?`;
      await runMysqlQueryWithParam(detailSql, [itemId]);
      return { status: true, msg: "Orders item canceled successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const completeOrderItems = async (user_id, role_id, orderIds) => {
  try {
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2) {
        const checkSql = `select franchise_id from tbl_orders where id in (?) and franchise_id!=?`;
        const check = await runMysqlQueryWithParam(checkSql, [orderIds, user_id]);
        if (check.length) {
          return { status: false, msg: "User not authorized to complete few of the orders." };
        }
      }
      const sql = `update tbl_orders set status=2 where id in (?)`;
      const detailSql = `update tbl_order_details set delivery_status=3, delivery_boy_id=NULL where order_id in (?) and delivery_status!=4`;
      await runMysqlQueryWithParam(sql, [orderIds]);
      await runMysqlQueryWithParam(detailSql, [orderIds]);
      return { status: true, msg: "Orders canceled successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const updateAdminNotes = async (user_id, role_id, orderId, adminNotes) => {
  try {
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2) {
        const checkSql = `select franchise_id from tbl_orders where id=? and franchise_id=?`;
        const check = await runMysqlQueryWithParam(checkSql, [orderId, user_id]);
        if (check.length) {
          return { status: false, msg: "User not authorized to complete few of the orders." };
        }
      }
      const sql = `update tbl_orders set admin_notes=? where id=?`;
      await runMysqlQueryWithParam(sql, [adminNotes, orderId]);
      return { status: true, msg: "Admin notes updated successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

const updateDeliveryDate = async (user_id, role_id, id, itemId, date) => {
  try {
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2) {
        const checkSql = `select franchise_id from tbl_orders where id=? and franchise_id=?`;
        const check = await runMysqlQueryWithParam(checkSql, [id, user_id]);
        if (check.length) {
          return { status: false, msg: "User not authorized to complete few of the orders." };
        }
      }
      const sql = `update tbl_order_details set delivery_date=? where id=?`;
      await runMysqlQueryWithParam(sql, [date, itemId]);
      return { status: true, msg: "Order date updated successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized to update." };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

module.exports = {
  getAllOrders,
  getDeleveryboyListOnFranchise,
  validateUpdatingOrder,
  updateDeleveryboyWithStatus,
  getOrderOnID,
  updateOrderDeliveryStatus,
  getFranchiseListOnOrder,
  updateDeliveryBoyOnOrder,
  cancelOrder,
  getAllOrdersByFranchise,
  cancelOrderItems,
  cancelOrderOnItemId,
  completeOrderItems,
  updateAdminNotes,
  updateDeliveryDate,
};
