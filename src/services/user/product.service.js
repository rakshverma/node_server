const {
  runMysqlQuery,
  runMysqlQueryWithParam,
  mysqlConnect,
  beginTransaction,
  commit,
  runTransectionQuery,
  rollback,
} = require("../../config/mysqlConfig");

const getCategoryList = async () => {
  try {
    const sql = `SELECT * FROM tbl_category ORDER BY id DESC`;
    const list = await runMysqlQuery(sql);
    return { status: true, msg: "Category list fetched successfully", responseObj: list };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to get category list", responseObj: [] };
  }
};

const getProductList = async (pinCode) => {
  try {
    const normalizedPinCode = `${pinCode || ""}`.trim();
    console.log("pinCode = ", normalizedPinCode);
    const param = JSON.stringify([normalizedPinCode]);
    const franchiseSql = `SELECT * FROM tbl_franchise_details WHERE JSON_CONTAINS(zip_codes, ?)`;
    const franchise = await runMysqlQueryWithParam(franchiseSql, [param]);
    let franchiseId = null;
    if (franchise.length) {
      franchiseId = franchise[0].user_id;
    }
    console.log("franchise = ", franchise);
    const priceJoin = franchiseId
      ? `SELECT * FROM tbl_product_price WHERE user_id=?`
      : `SELECT *
         FROM (
           SELECT pp.*, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY is_available DESC, id ASC) AS row_number
           FROM tbl_product_price pp
         ) ranked_prices
         WHERE row_number=1`;
    const params = franchiseId ? [franchiseId] : [];
    const sql = `SELECT p.*, 
                  IFNULL(pp.quantity_wise_price, null) as quantity_wise_price,
                  IFNULL(pp.is_available, 0) as is_available,
                  IFNULL(pp.delevery_days, null) as delevery_days,
                  IFNULL(pp.user_id, null) as franchise_id,
                  c.name AS category_name
                FROM tbl_products p
                LEFT JOIN (
                ${priceJoin}
                ) pp 
                ON p.id = pp.product_id
                LEFT JOIN tbl_category c ON p.category_id = c.id WHERE p.status=1 ORDER BY p.id DESC`;
    const list = await runMysqlQueryWithParam(sql, params);
    return { status: true, msg: "Product list fetched successfully", responseObj: list };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to get product list", responseObj: [] };
  }
};

const getProductReview = async (productId) => {
  try {
    let whereClause = "";
    let paramArray = [];
    if (productId) {
      whereClause = `WHERE product_id=?`;
      paramArray = [productId];
    }
    const sql = `SELECT * FROM tbl_product_review ${whereClause} ORDER BY id DESC`;
    const list = await runMysqlQueryWithParam(sql, paramArray);
    return { status: true, msg: "products reviews fetched successfully", responseObj: list };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to load product reviews. Please try again.", responseObj: [] };
  }
};

const getShippingCostOnPin = async (pinCode) => {
  try {
    const normalizedPinCode = `${pinCode || ""}`.trim();
    const sql = `SELECT shipping_cost FROM tbl_shipping_cost where pin_code=?`;
    const list = await runMysqlQueryWithParam(sql, [normalizedPinCode]);
    console.log("list= ", list, normalizedPinCode);
    let cost = 0;
    if (list.length) {
      cost = list[0].shipping_cost;
    }
    return { status: true, msg: "shipping cost fetched successfully", responseObj: cost };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to fetch shipping cost for this pin code. Please verify Supabase database setup.", responseObj: 0 };
  }
};

module.exports = { getCategoryList, getProductList, getProductReview, getShippingCostOnPin };
