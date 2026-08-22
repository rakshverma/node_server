const {
  runMysqlQuery,
  runMysqlQueryWithParam,
} = require("../../config/mysqlConfig");

const addCategory = async (category) => {
  try {
    const normalizedCategory = category.trim();
    const sql = "SELECT id from tbl_category where LOWER(name) = LOWER(?)";
    const check = await runMysqlQueryWithParam(sql, [normalizedCategory]);
    console.log("CHECK = ", check);
    if (check.length) {
      return { status: false, statusCode: 409, msg: "Category name already exists." };
    }

    const insertSql = "INSERT INTO tbl_category set name=?";
    const insert = await runMysqlQueryWithParam(insertSql, [normalizedCategory]);
    console.log("INSERT = ", insert);
    if (insert) {
      return {
        status: true,
        msg: "Category added successfully",
      };
    } else {
      return {
        status: false,
        msg: "Unable to add category. Please try again.",
      };
    }
  } catch (e) {
    return { status: false, msg: "Something went wrong. Please try again" };
  }
};

const editCategory = async (category, id) => {
  try {
    const normalizedCategory = category.trim();
    const sql = "SELECT id from tbl_category where LOWER(name) = LOWER(?) AND id!=?";
    const check = await runMysqlQueryWithParam(sql, [normalizedCategory, id]);
    console.log("CHECK = ", check);
    if (check.length) {
      return { status: false, statusCode: 409, msg: "Category name already exists." };
    }

    const updateSql = "UPDATE tbl_category set name=? where id=?";
    const update = await runMysqlQueryWithParam(updateSql, [normalizedCategory, id]);
    console.log("UPDATE = ", update);
    if (update) {
      return {
        status: true,
        msg: "Category updated successfully",
      };
    } else {
      return {
        status: false,
        msg: "Unable to update category. Please try again.",
      };
    }
  } catch (e) {
    return { status: false, msg: "Something went wrong. Please try again" };
  }
};

const getCategoryList = async () => {
  try {
    const sql = "SELECT * FROM tbl_category ORDER BY id DESC";
    const list = await runMysqlQuery(sql);
    return {
      status: true,
      msg: "Category list fetched successfully",
      responseObj: list,
    };
  } catch (e) {
    console.log("get category error= ", e);
    return {
      status: false,
      msg: "Unable to get category list. Please try again.",
    };
  }
};

const deleteCategory = async (id) => {
  if (!id)
    return {
      status: false,
      msg: "Something went wrong. Please try again.",
      responseObj: [],
    };
  try {
    const sql = "DELETE from tbl_category WHERE id=?";
    const del = await runMysqlQueryWithParam(sql, [id]);
    if (del) {
      const listSql = "SELECT * FROM tbl_category ORDER BY id DESC";
      const list = await runMysqlQuery(listSql);
      return {
        status: true,
        msg: "Category added successfully",
        responseObj: list,
      };
    } else {
      return {
        status: false,
        msg: "Unable to delete category list. Please try again.",
        responseObj: [],
      };
    }
  } catch (e) {
    return {
      status: false,
      msg: "Something went wrong. Please try again.",
      responseObj: [],
    };
  }
};

module.exports = {
  addCategory,
  getCategoryList,
  editCategory,
  deleteCategory,
};
