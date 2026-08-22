const { runMysqlQuery, runMysqlQueryWithParam } = require("../../config/mysqlConfig");

const getAllCustomers = async (user_id, role_id) => {
  try {
    if (role_id === 1 || role_id === 2) {
      const sql = `SELECT u.*, ud.street, ud.district, ud.state, ud.landmark, ud.pin_code, (select count(id) from tbl_orders where user_id=u.id) as total_orders FROM tbl_users u LEFT JOIN tbl_user_details ud ON u.id=ud.user_id WHERE role_id = 4 ORDER BY u.id DESC`;
      const list = await runMysqlQuery(sql);
      return { status: true, msg: "Customer list fetched successfully", responseObj: list };
    } else {
      return { status: false, msg: "User not authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again." };
  }
};

module.exports = {
  getAllCustomers,
};
