const bcrypt = require("bcryptjs");
const config = require("../../config").get(process.env.ENV);
const {
  runMysqlQuery,
  runMysqlQueryWithParam,
  mysqlConnect,
  beginTransaction,
  commit,
  runTransectionQuery,
  rollback,
} = require("../../config/mysqlConfig");
const { generateRandomString } = require("../../utils/utilityFunctions");

const getCurrentUser = async (userId, roleId) => {
  try {
    if (roleId === 4) {
      console.log("userId = ", userId);
      const sql = `SELECT id, email, name, phone_number, status FROM tbl_users WHERE role_id=4 AND id=?`;
      const check = await runMysqlQueryWithParam(sql, [userId]);
      if (check.length) {
        return {
          status: true,
          msg: "Admin info fetched successfully",
          responseObj: check[0],
        };
      } else {
        return { status: false, msg: "Unable to get user info", responseObj: {} };
      }
    } else {
      return { status: false, msg: "User not authorized", responseObj: {} };
    }
  } catch (e) {
    return { status: false, msg: "Please try again", responseObj: {} };
  }
};

const getUserDistrict = async (pincode) => {
  try {
    const sql = `SELECT district FROM mst_pin_codes WHERE pin_code=?`;
    const response = await runMysqlQueryWithParam(sql, [pincode]);
    if (response.length) {
      return {
        status: true,
        msg: "District fetched successfully",
        responseObj: response[0].district,
      };
    } else {
      return {
        status: true,
        msg: "District fetched successfully",
        responseObj: "",
      };
    }
  } catch (e) {
    return { status: false, msg: "Please try again", responseObj: {} };
  }
};

const getDistrictList = async () => {
  try {
    const sql = `SELECT DISTINCT(district) FROM mst_pin_codes order by district asc`;
    const response = await runMysqlQuery(sql);
    return {
      status: true,
      msg: "District fetched successfully",
      responseObj: response,
    };
  } catch (e) {
    return { status: false, msg: "Could not fetch district list. Please try again", responseObj: [] };
  }
};

const addUserAddress = async (street, state, district, pincode, landmark, user_id) => {
  console.log("user_id = ", user_id);
  try {
    const sql = `select district from mst_pin_codes where pin_code=?`;
    const check = await runMysqlQueryWithParam(sql, [pincode]);
    if (check.length && check[0].district !== district) return { status: false, msg: "District and pin code does not match", responseObj: [] };
    const userCheck = await runMysqlQueryWithParam("select id from tbl_user_details where user_id=?", [user_id]);
    if (userCheck.length) {
      const updateSql = `update tbl_user_details set street=?, state=?, district=?, pin_code=?, landmark=? where user_id=?`;
      await runMysqlQueryWithParam(updateSql, [street, state, district, pincode, landmark, user_id]);
    } else {
      const addSql = `insert into tbl_user_details (user_id, street, state, district, pin_code, landmark) values (?,?,?,?,?,?)`;
      await runMysqlQueryWithParam(addSql, [user_id, street, state, district, pincode, landmark]);
    }
    return {
      status: true,
      msg: "Address updated successfully",
      responseObj: { street, state, district, pin_code: pincode, landmark },
    };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Could not update address. Please try again", responseObj: [] };
  }
};

const updateUserAccount = async (formData, email) => {
  try {
    const sql = `select id from tbl_users where email=?`;
    const check = await runMysqlQueryWithParam(sql, [email.trim()]);
    if (check.length) {
      let updateSql = `update tbl_users set name=? where id=?`;
      if (formData.password) {
        updateSql = `update tbl_users set name=?, password=? where id=?`;
        const hashedPassword = bcrypt.hashSync(formData.password, config.saltRounds);
        await runMysqlQueryWithParam(updateSql, [`${formData.firstName} ${formData.lastName}`, hashedPassword, check[0].id]);
      } else {
        await runMysqlQueryWithParam(updateSql, [`${formData.firstName} ${formData.lastName}`, check[0].id]);
      }
      return { status: true, msg: "Account information updated successfully", responseObj: [] };
    } else {
      return { status: false, msg: "User not permitted to update account information", responseObj: [] };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Could not update user information. Please try again", responseObj: [] };
  }
};

module.exports = {
  getCurrentUser,
  getUserDistrict,
  getDistrictList,
  addUserAddress,
  updateUserAccount,
};
