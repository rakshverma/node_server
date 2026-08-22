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
const getUserMsg = async () => {
  return "no user found";
};

const getCurrentUser = async (userId, roleId) => {
  try {
    let sql = `SELECT u.*, f.state, f.district, f.zip_codes FROM tbl_users u LEFT JOIN tbl_franchise_details f on u.id=f.user_id WHERE u.id = ?`;
    if (roleId === 2) {
      sql = `SELECT u.*,f.franchise_name, f.state, f.district, f.zip_codes FROM tbl_users u LEFT JOIN tbl_franchise_details f ON u.id=f.user_id WHERE u.id = ?`;
    }
    if (roleId === 3) {
      sql = `SELECT u.*, f.franchise_name, d.state, d.district,d.franchise_id FROM tbl_users u LEFT JOIN tbl_delevery_boy_details d ON u.id=d.user_id LEFT JOIN tbl_franchise_details f ON d.franchise_id=f.user_id WHERE u.id = ?`;
    }
    //const sql = "SELECT * FROM `tbl_users` WHERE id = ?";
    const check = await runMysqlQueryWithParam(sql, [userId]);
    if (check.length) {
      const { id, role_id, name, phone_number } = check[0];
      const responseObj = check[0];
      return {
        status: true,
        msg: "Admin info fetched successfully",
        responseObj,
      };
    } else {
      return { status: false, msg: "Unable to get user info" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong. Please try again" };
  }
};

const getPinCodeOnUser = async (user_id, role_id, district) => {
  try {
    if (role_id === 1 || role_id === 2) {
      if (!district) return { status: true, msg: "", responseObj: [] };
      const sql = `SELECT DISTINCT(pin_code) FROM mst_pin_codes WHERE district=? ORDER BY pin_code ASC`;
      const list = await runMysqlQueryWithParam(sql, [district]);
      const checkSql = `SELECT zip_codes FROM tbl_franchise_details WHERE district=? AND user_id !=?`;
      const checkList = await runMysqlQueryWithParam(checkSql, [district, user_id]);
      let addedZips = [];
      if (checkList.length) {
        checkList.forEach((item) => {
          addedZips = item.zip_codes && [...addedZips, ...JSON.parse(item.zip_codes)];
        });
      }
      const zipCodesList = list.filter((obj) => addedZips.indexOf(obj.pin_code) === -1);
      return { status: true, msg: "", responseObj: zipCodesList };
    } else {
      return { status: false, msg: "User Not Authorized" };
    }
  } catch (e) {
    console.log("pin code user error = ", e);
    return { status: false, msg: "Unable to fetch pincode list" };
  }
};

const editProfile = async (data, user_id, role_id) => {
  console.log("PROFILE DATA = ", data);
  try {
    const { name, phone, email, status, state, district, zipCodes, franchiseName } = data;
    const checksql = `SELECT id, phone_number, email FROM tbl_users WHERE id!=? AND (role_id=1 OR role_id=2 OR role_id=3) AND (email=? OR phone_number=?) `;
    const check = await runMysqlQueryWithParam(checksql, [user_id, email.trim(), phone]);
    console.log("check result = ", check);
    if (check.length) {
      const err = [];
      check.forEach((element) => {
        if (element.email == email.trim()) err.indexOf("Email") === -1 ? err.push("Email") : null;
        if (element.phone_number == phone) err.indexOf("Phone No.") === -1 ? err.push("Phone No.") : null;
      });
      return { status: false, msg: `${err.toString()} already exists`, responseObj: {} };
    }

    let checkDetailsSql = `SELECT id FROM tbl_franchise_details WHERE user_id=?`;
    if (role_id === 3) {
      checkDetailsSql = `SELECT id FROM tbl_delevery_boy_details WHERE user_id=?`;
    }
    const checkDetails = await runMysqlQueryWithParam(checkDetailsSql, [user_id]);
    const connection = await mysqlConnect();
    try {
      await beginTransaction(connection);
      const sql = `UPDATE tbl_users SET name=?, email=?, phone_number=?, status=? WHERE id=?`;
      const update = await runTransectionQuery(connection, sql, [name, email.trim(), phone, status, user_id]);
      if (checkDetails.length) {
        if (role_id === 3) {
          const detailsSql = `UPDATE tbl_delevery_boy_details SET state=?, district=? WHERE user_id=?`;
          const updateDetails = await runTransectionQuery(connection, detailsSql, [state, district, user_id]);
        } else {
          let detailsSql = `UPDATE tbl_franchise_details SET state=?, district=?, zip_codes=? WHERE user_id=?`;
          let params = [state, district, zipCodes, user_id];
          if (role_id === 2) {
            detailsSql = `UPDATE tbl_franchise_details SET franchise_name=?, state=?, district=?, zip_codes=? WHERE user_id=?`;
            params = [franchiseName, state, district, zipCodes, user_id];
          }
          const updateDetails = await runTransectionQuery(connection, detailsSql, params);
        }
        await commit(connection);
        connection.release();
      } else {
        if (role_id === 3) {
          const detailsSql = `INSERT INTO tbl_delevery_boy_details SET user_id=?, state=?, district=?`;
          const insertDetails = await runTransectionQuery(connection, detailsSql, [user_id, state, district]);
        } else {
          let detailsSql = `INSERT INTO tbl_franchise_details SET user_id=?, state=?, district=?, zip_codes=?`;
          let params = [user_id, state, district, zipCodes];
          if (role_id === 2) {
            detailsSql = `INSERT INTO tbl_franchise_details SET user_id=?, franchise_name=?, state=?, district=?, zip_codes=?`;
            params = [user_id, franchiseName, state, district, zipCodes];
          }
          const insertDetails = await runTransectionQuery(connection, detailsSql, params);
        }
        await commit(connection);
        connection.release();
      }
      await commit(connection);
      connection.release();
      return { status: true, msg: "Profile updated successfully.", responseObj: {} };
    } catch (e) {
      console.log("PROFILE update error = ", e);
      await rollback(connection);
      connection.release();
      return { status: false, msg: "Unable to update profile. Please try again", responseObj: {} };
    }
  } catch (e) {
    console.log("User Profile error = ", e);
    return { status: false, msg: "Something went wrong. Please try again.", responseObj: {} };
  }
};

const changePassword = async (data, user_id, role_id) => {
  try {
    const { oldPassword, newPassword } = data;
    const checkSql = `SELECT password FROM tbl_users WHERE id=?`;
    const check = await runMysqlQueryWithParam(checkSql, [user_id]);
    if (!check.length) return { status: false, msg: "User Not authorized", responseObj: {} };
    if (!bcrypt.compareSync(oldPassword, check[0].password)) return { status: false, msg: "Old password is not correct.", responseObj: {} };
    const password = bcrypt.hashSync(newPassword, config.saltRounds);
    const sql = `UPDATE tbl_users SET password=? WHERE id=?`;
    const update = await runMysqlQueryWithParam(sql, [password, user_id]);
    return { status: true, msg: "Password updated successfully.", responseObj: {} };
  } catch (e) {
    console.log("change password error = ", e);
    return { status: false, msg: "Something went wrong. Please try again.", responseObj: {} };
  }
};

module.exports = {
  getUserMsg,
  getCurrentUser,
  getPinCodeOnUser,
  editProfile,
  changePassword,
};
