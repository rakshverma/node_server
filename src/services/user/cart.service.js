const { runMysqlQuery, runMysqlQueryWithParam } = require("../../config/mysqlConfig");

const addCartDetails = async (data) => {
  try {
    const { cartId, userId, productId, franchiseId, quantity, unit, price, shippingCost, count } = data;
    const sql = `INSERT INTO tbl_cart (cartId, userId, productId, franchiseId, quantity, unit, price, shippingCost, count ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
    await runMysqlQueryWithParam(sql, [cartId, userId, productId, franchiseId, quantity, unit, price, shippingCost, count]);
    return { status: true, msg: "cart details added successfully", responseObj: [] };
  } catch (e) {
    return { status: false, msg: "something went wrong", responseObj: [] };
  }
};

const updateCartDetails = async (data) => {
  try {
    const { cartId, userId, productId, quantity, unit, price, shippingCost, count } = data;
    const sql = `UPDATE tbl_cart SET count=? WHERE cartId=? AND productId=? AND quantity=? AND unit=?`;
    await runMysqlQueryWithParam(sql, [count, cartId, productId, quantity, unit]);
    return { status: true, msg: "cart details added successfully", responseObj: [] };
  } catch (e) {
    return { status: false, msg: "something went wrong", responseObj: [] };
  }
};

const getCartDetails = async ({ cartId, userId }) => {
  try {
    cartId = !cartId || cartId === "null" || cartId === "undefined" ? null : cartId;
    userId = !userId || userId === "null" || userId === "undefined" ? null : userId;
    if (!cartId && !userId) return { status: false, msg: "Unable to get cart details. Please try again", responseObj: [] };
    let sql = null;
    let param = [];
    if (cartId) {
      sql = `SELECT c.cartId, c.userId, c.productId, c.quantity, c.unit, c.price, c.franchiseId, c.count, p.name,p.images 
              FROM tbl_cart c 
              LEFT JOIN tbl_products p 
              ON c.productId=p.id 
              WHERE cartId=?`;
      param = [cartId];
    } else {
      sql = `SELECT c.cartId, c.userId, c.productId, c.quantity, c.unit, c.price, c.franchiseId, c.count, p.name,p.images 
              FROM tbl_cart c 
              LEFT JOIN tbl_products p 
              ON c.productId=p.id 
              WHERE userId=? 
              ORDER BY userId DESC LIMIT 0,1`;
      param = [userId];
    }
    if (!sql) return { status: false, msg: "Unable to get cart details. Please try again", responseObj: [] };
    const res = await runMysqlQueryWithParam(sql, param);
    return { status: true, msg: "cart details fetched successfully", responseObj: res };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to get cart details. Please try again", responseObj: [] };
  }
};

const getCartProductDetails = async (cartId) => {
  try {
    const sql = `SELECT p.name, p.images, c.cartId, c.userId, c.productId, c.franchiseId, c.quantity, c.unit, c.price, c.shippingCost, c.count,
                  IFNULL(pp.quantity_wise_price, null) as quantity_wise_price,
                  IFNULL(pp.is_available, 0) as is_available,
                  IFNULL(pp.delevery_days, null) as delevery_days
                  FROM tbl_cart c 
                  LEFT JOIN tbl_products p 
                  ON c.productId = p.id 
                  LEFT JOIN tbl_product_price pp
                  ON c.productId = pp.product_id
                  WHERE c.cartId=? AND c.franchiseId = pp.user_id`;
    const res = await runMysqlQueryWithParam(sql, [cartId]);
    console.log("RESPONSE = ", res);
    return { status: true, msg: "cart products details fetched successfully", responseObj: res };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to get cart details. Please try again", responseObj: [] };
  }
};

const removeCartItem = async (cartId, body) => {
  try {
    const { productId, quantity, unit } = body;
    const sql = `DELETE FROM tbl_cart WHERE cartId=? AND productId=? AND quantity=? AND unit=?`;
    await runMysqlQueryWithParam(sql, [cartId, productId, quantity, unit]);
    return { status: true, msg: "cart item removed successfully", responseObj: [] };
  } catch (e) {
    return { status: false, msg: "Unable to remove cart item, please try again.", responseObj: [] };
  }
};

const removeCart = async (cartId) => {
  try {
    const sql = `DELETE FROM tbl_cart WHERE cartId=?`;
    await runMysqlQueryWithParam(sql, [cartId]);
    return { status: true, msg: "cart removed successfully", responseObj: [] };
  } catch (e) {
    return { status: false, msg: "Unable to remove cart, please try again.", responseObj: [] };
  }
};

module.exports = {
  addCartDetails,
  getCartDetails,
  updateCartDetails,
  getCartProductDetails,
  removeCartItem,
  removeCart,
};
