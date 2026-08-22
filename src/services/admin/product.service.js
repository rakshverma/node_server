const { runMysqlQuery, runMysqlQueryWithParam } = require("../../config/mysqlConfig");
const { deleteFiles, uploadFiles } = require("../../utils/supabaseStorage");

const validateAddProducts = async (data, fileNames) => {
  try {
    const { name, category, description } = data;
    if (!name || !category || !description) {
      return { status: false, msg: "Enter valid data for adding products", responseObj: {} };
    } else {
      return {
        status: true,
        msg: "",
        responseObj: {},
      };
    }
  } catch (e) {
    return {
      status: false,
      msg: "Something went wrong. Please try again",
      responseObj: {},
    };
  }
};

const addProduct = async (data, files) => {
  try {
    const { name, category, description } = data;
    const existSql = "SELECT id FROM tbl_products WHERE name=? AND category_id=?";
    const check = await runMysqlQueryWithParam(existSql, [name.trim(), category]);
    if (check.length)
      return {
        status: false,
        msg: "Product name already exists.",
        responseObj: {},
      };
    const fileNames = await uploadFiles(files, "products");
    const sql = "INSERT INTO tbl_products set name=?, category_id=?, description=?, images=?";
    const insert = await runMysqlQueryWithParam(sql, [name, category, description, JSON.stringify(fileNames)]);
    if (insert)
      return {
        status: true,
        msg: "Product added successfully.",
        responseObj: {},
      };
  } catch (e) {
    return {
      status: false,
      msg: "Something went wrong. Please try again",
      responseObj: {},
    };
  }
};

const editProduct = async (data, files, productId) => {
  try {
    const { name, category, description } = data;
    const existSql = "SELECT id FROM tbl_products WHERE name=? AND category_id=? AND id!=?";
    const check = await runMysqlQueryWithParam(existSql, [name.trim(), category, productId]);
    if (check.length)
      return {
        status: false,
        msg: "Product name already exists.",
        responseObj: {},
      };
    const oldImagesSql = "SELECT images FROM tbl_products WHERE id=?";
    const oldImages = await runMysqlQueryWithParam(oldImagesSql, [productId]);
    let sql = "UPDATE tbl_products set name=?, category_id=?, description=? WHERE id=?";
    let params = [name, category, description, productId];
    const fileNames = files.length ? await uploadFiles(files, "products") : [];
    if (fileNames.length) {
      sql = "UPDATE tbl_products set name=?, category_id=?, description=?, images=? WHERE id=?";
      params = [name, category, description, JSON.stringify(fileNames), productId];
    }
    await runMysqlQueryWithParam(sql, params);
    try {
      if (fileNames.length && oldImages?.[0]?.images) {
        await deleteFiles(JSON.parse(oldImages[0].images));
      }
    } catch (e) {}
    return {
      status: true,
      msg: "Product updated successfully.",
      responseObj: {},
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      msg: "Something went wrong. Please try again",
      responseObj: {},
    };
  }
};

const getProductList = async (user_id, role_id, franchiseId) => {
  try {
    const user = franchiseId && role_id === 1 ? franchiseId : user_id;
    console.log("user = ", user, franchiseId, user_id);
    const sql = `SELECT p.*, 
                    IFNULL(pp.quantity_wise_price, null) as quantity_wise_price,
                    IFNULL(pp.is_available, 0) as is_available,
                    IFNULL(pp.delevery_days, null) as delevery_days,
                    c.name AS category_name
                FROM tbl_products p
                LEFT JOIN (
                SELECT *
                FROM tbl_product_price
                WHERE user_id=?
                ) pp 
                ON p.id = pp.product_id
                LEFT JOIN tbl_category c ON p.category_id = c.id ORDER BY p.id DESC`;
    const list = await runMysqlQueryWithParam(sql, [user]);
    console.log("sql = ", sql);
    console.log("list = ", list);
    let whereClause = `WHERE u.id=? and u.status!=3 and u.status!=4`;
    if (role_id === 1) whereClause = `WHERE u.id=? OR u.role_id=2 and u.status!=3 and u.status!=4`;
    //const franchiseSql = `SELECT * FROM tbl_users ${whereClause}`;
    const franchiseSql = `SELECT u.id, u.role_id, u.name, u.email, u.phone_number, u.status, u.added_by, f.franchise_name, f.state, f.district, f.zip_codes
                          FROM tbl_users u
                          LEFT JOIN 
                          tbl_franchise_details f
                          ON u.id=f.user_id 
                          ${whereClause}
                          ORDER BY u.id ASC`;
    const franchiseList = await runMysqlQueryWithParam(franchiseSql, [user_id]);
    return {
      status: true,
      msg: "Product list fetched successfully",
      responseObj: { productList: list, franchiseList: franchiseList, franchiseId: user },
    };
  } catch (e) {
    console.log("get product error= ", e);
    return {
      status: false,
      msg: "Unable to get product list. Please try again.",
    };
  }
};

const validateUserForPriceInfo = async (data) => {
  const { distributerId, user_id, role_id } = data;
  try {
    if (role_id === 1) {
      const sql = `SELECT role_id FROM tbl_users WHERE id=?`;
      const check = await runMysqlQueryWithParam(sql, [user_id]);
      if (!check.length) return { status: false, msg: "User not authorized to edit price" };
      if (check[0].role_id !== role_id) return { status: false, msg: "User not authorized to edit price" };
      return { status: true, msg: "" };
    }
    console.log("USER ID = ", user_id);
    console.log("distributerId = ", distributerId);
    console.log("role_id = ", role_id);
    if (user_id !== parseInt(distributerId)) {
      console.log("came in heloooooooo");
      return { status: false, msg: "User not authorized to edit price" };
    } else return { status: true, msg: "" };
  } catch (e) {
    return { status: true, msg: "" };
  }
};

const getEditPriceInfo = async (data) => {
  const { productId, distributerId, user_id, role_id } = data;
  try {
    // const sql = `SELECT p.name,pp.* FROM tbl_products p
    //            LEFT JOIN tbl_product_price pp ON p.id = pp.product_id
    //            WHERE p.id=? AND (pp.user_id=? OR pp.user_id IS NULL)`;
    const sql = `SELECT p.name, 
    IFNULL(pp.product_id, null) as product_id,
    IFNULL(pp.role_id, null) as role_id,
    IFNULL(pp.user_id, null) as user_id,
    IFNULL(pp.category_id, null) as category_id,
    IFNULL(pp.added_by, null) as added_by,
    IFNULL(pp.quantity_wise_price, null) as quantity_wise_price,
    IFNULL(pp.is_available, 0) as is_available,
    IFNULL(pp.delevery_days, null) as delevery_days
FROM tbl_products p
LEFT JOIN (
SELECT *
FROM tbl_product_price
WHERE user_id=?
) pp 
ON p.id = pp.product_id WHERE p.id=?`;
    const productPrice = await runMysqlQueryWithParam(sql, [distributerId, productId]);
    console.log("productPrice = ", productPrice);
    if (!productPrice.length) return { status: false, msg: "User not authorized to edit price" };
    const franchiseSql = `SELECT id, name, IF(u.role_id = 2, (SELECT f.franchise_name FROM tbl_franchise_details f WHERE u.id = f.user_id), NULL) AS franchise_name from tbl_users u WHERE u.id=?`;
    const franchiseInfo = await runMysqlQueryWithParam(franchiseSql, [distributerId]);
    return { status: true, msg: "", responseObj: { editInfo: productPrice[0], franchiseInfo: franchiseInfo[0] } };
  } catch (e) {
    return { status: false, msg: "Something went wrong." };
  }
};

const getProductPriceOnFranchise = async (id) => {
  try {
    const sql = `SELECT p.*, 
                  IFNULL(pp.quantity_wise_price, null) as quantity_wise_price,
                  IFNULL(pp.is_available, 0) as is_available,
                  IFNULL(pp.delevery_days, null) as delevery_days,
                  c.name AS category_name
                FROM tbl_products p
                LEFT JOIN (
                SELECT *
                FROM tbl_product_price
                WHERE user_id=?
                ) pp 
                ON p.id = pp.product_id
                LEFT JOIN tbl_category c ON p.category_id = c.id ORDER BY p.id DESC`;
    const list = await runMysqlQueryWithParam(sql, [id]);
    return {
      status: true,
      msg: "Product list fetched successfully",
      responseObj: { productList: list },
    };
  } catch (e) {
    console.log("get product error= ", e);
    return {
      status: false,
      msg: "Unable to get product list. Please try again.",
    };
  }
};

const updateProductPrice = async (info) => {
  try {
    const { productId, distributerId, user_id, role_id, data } = info;
    console.log("edit data = ", productId, distributerId, user_id, role_id, data);
    const checkSql = `SELECT id from tbl_product_price WHERE product_id=? AND user_id=?`;
    const check = await runMysqlQueryWithParam(checkSql, [productId, distributerId]);
    const roleSql = `SELECT role_id from tbl_users where id=?`;
    const distributerRoleId = await runMysqlQueryWithParam(roleSql, [distributerId]);
    if (!distributerRoleId.length) return { status: false, msg: "Unable to update price info. Please try again." };
    if (check.length && distributerRoleId.length) {
      const sql = `UPDATE tbl_product_price 
                   SET 
                   role_id=?,
                   category_id=1,
                   added_by=?,
                   quantity_wise_price=?,
                   is_available=?,
                   delevery_days=? WHERE product_id=? AND user_id=?`;
      const update = await runMysqlQueryWithParam(sql, [
        distributerRoleId[0].role_id,
        user_id,
        JSON.stringify(data.quantity_wise_price),
        data.is_available,
        JSON.stringify(data.delevery_days),
        productId,
        distributerId,
      ]);
      if (update) return { status: true, msg: "Price updated successfully." };
      else return { status: false, msg: "Unable to update price info. Please try again." };
    }
    const insertSql = `INSERT INTO tbl_product_price 
                       SET
                       product_id=?,
                       role_id=?,
                       user_id=?,
                       category_id=1,
                       added_by=?,
                       quantity_wise_price=?,
                       is_available=?,
                       delevery_days=?`;
    const insert = await runMysqlQueryWithParam(insertSql, [
      productId,
      distributerRoleId[0].role_id,
      distributerId,
      user_id,
      JSON.stringify(data.quantity_wise_price),
      data.is_available,
      JSON.stringify(data.delevery_days),
    ]);
    if (insert) return { status: true, msg: "Price updated successfully." };
    else return { status: false, msg: "Unable to update price info. Please try again." };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong. Please try again." };
  }
};

const getProductReviews = async (role_id) => {
  try {
    if (role_id === 1 || role_id === 2) {
      const sql = `SELECT pr.id, p.name, p.images, pr.message, pr.stars, pr.inserted_at, u.name as user_name, u.phone_number, u.email
                   FROM tbl_product_review pr
                   LEFT JOIN
                   tbl_products p
                   ON p.id=pr.product_id
                   LEFT JOIN tbl_users u
                   ON pr.user_id=u.id WHERE pr.status=1 ORDER BY p.id DESC`;
      const reviewList = await runMysqlQuery(sql);
      return { status: true, msg: "Product reviews list fetched successfully", responseObj: reviewList };
    } else {
      return { status: false, msg: "User not authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong. Please try again." };
  }
};

const updateProductStatus = async (productId, status) => {
  try {
    const sql = `UPDATE tbl_products set status=? WHERE id=?`;
    await runMysqlQueryWithParam(sql, [status, productId]);
    return { status: true, msg: "Product status updated successfully", responseObj: {} };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong. Please try again.", responseObj: {} };
  }
};

const deleteReviews = async (id, role_id, user_id) => {
  try {
    if (role_id === 1) {
      const sql = `delete from tbl_product_review where id=?`;
      await runMysqlQueryWithParam(sql, [id]);
      return { status: true, msg: "Product status updated successfully", responseObj: {} };
    } else {
      return { status: false, msg: "User not authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong. Please try again.", responseObj: {} };
  }
};

module.exports = {
  validateAddProducts,
  addProduct,
  editProduct,
  getProductList,
  validateUserForPriceInfo,
  getEditPriceInfo,
  getProductPriceOnFranchise,
  updateProductPrice,
  getProductReviews,
  updateProductStatus,
  deleteReviews,
};
