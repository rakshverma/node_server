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

const getAllDeleveryBoyList = async (user_id, role_id) => {
  try {
    if (role_id === 1 || role_id === 2) {
      let whereClause = `WHERE u.role_id=3`;
      let params = [];
      if (role_id === 2) {
        whereClause = `WHERE u.role_id=3 AND d.franchise_id=?`;
        params = [user_id];
      }
      const sql = `SELECT u.id, u.role_id, u.name, u.status, u.email, u.phone_number, u.added_by, u.inserted_at, u.modified_at, d.franchise_id, d.state, d.district, f.franchise_name, au.name AS addedby_name
                             FROM tbl_users u
                             LEFT JOIN tbl_delevery_boy_details d
                             ON u.id = d.user_id
                             LEFT JOIN tbl_franchise_details f
                             ON d.franchise_id=f.user_id
                             JOIN tbl_users au ON au.id=u.added_by
                             ${whereClause} AND u.status!=4
                             ORDER BY u.id DESC`;
      const select = await runMysqlQueryWithParam(sql, params);
      return { status: true, msg: "Delevery boy list fetched successfully.", responseObj: select };
    } else {
      return { status: false, msg: "User Not Authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again" };
  }
};

const addDeleveryBoy = async (data, user_id, role_id) => {
  try {
    const { name, phone, email, franchiseId, status, state, district } = data;
    const randomPassword = bcrypt.hashSync("test123", config.saltRounds);
    if (role_id === 1 || role_id === 2) {
      const checkSql = `SELECT u.email, u.phone_number
                        FROM tbl_users u
                        LEFT JOIN
                        tbl_delevery_boy_details f
                        ON
                        u.id = f.user_id
                        WHERE 
                        u.email=? OR u.phone_number=?`;
      const check = await runMysqlQueryWithParam(checkSql, [email, phone]);
      if (check.length) {
        const err = [];
        check.forEach((element) => {
          if (element.email == email.trim()) err.indexOf("Email") === -1 ? err.push("Email") : null;
          if (element.phone_number == phone) err.indexOf("Phone No.") === -1 ? err.push("Phone No.") : null;
        });
        return { status: false, msg: `${err.toString()} already exists`, responseObj: {} };
      }
      const connection = await mysqlConnect();
      try {
        await beginTransaction(connection);
        const insertUserSql = "INSERT INTO tbl_users (role_id, name, password, email, phone_number, status, added_by) VALUES (?, ?, ? , ?, ?, ?, ?)";
        const insertUser = await runTransectionQuery(connection, insertUserSql, [
          3,
          name.trim(),
          randomPassword,
          email.trim(),
          phone,
          status,
          user_id,
        ]);
        const insertId = insertUser.insertId;
        const franchiseSql = "INSERT tbl_delevery_boy_details (user_id, franchise_id, state, district) VALUES (?, ?, ?, ?)";
        const insertFranchiseDetails = await runTransectionQuery(connection, franchiseSql, [insertId, franchiseId, state, district]);
        await commit(connection);
        return { status: true, msg: "Delivery boy added successfully.", responseObj: {} };
      } catch (e) {
        await rollback(connection);
        return { status: false, msg: "Unable to add delivery boy. Please try again", responseObj: {} };
      } finally {
        console.log("came in connection release");
        connection.release();
      }
    } else {
      return { status: false, msg: "Permission denied to add delivery boy", responseObj: {} };
    }
  } catch (e) {
    console.log("deliveryboy error = ", e);
    return { status: false, msg: "Please try again.", responseObj: {} };
  }
};

const editDeleveryBoy = async (data, editId, user_id, role_id) => {
  try {
    const { name, phone, email, franchiseId, status, state, district } = data;
    if (role_id === 1 || role_id === 2) {
      if (role_id === 2 && user_id != data.franchiseId) {
        return { status: false, msg: "Permission denied to update delivery boy", responseObj: {} };
      }
      const checkSql = `SELECT u.email, u.phone_number
                        FROM tbl_users u
                        LEFT JOIN
                        tbl_delevery_boy_details f
                        ON
                        u.id = f.user_id
                        WHERE 
                        u.id != ? and (u.email=? OR u.phone_number=?)`;
      const check = await runMysqlQueryWithParam(checkSql, [editId, email, phone]);
      console.log("check = ", check);
      if (check.length) {
        const err = [];
        check.forEach((element) => {
          if (element.email == email.trim()) err.indexOf("Email") === -1 ? err.push("Email") : null;
          if (element.phone_number == phone) err.indexOf("Phone No.") === -1 ? err.push("Phone No.") : null;
        });
        return { status: false, msg: `${err.toString()} already exists`, responseObj: {} };
      }
      const connection = await mysqlConnect();
      try {
        await beginTransaction(connection);
        const insertUserSql = "UPDATE tbl_users set name=?, email=?, phone_number=?, status=? where id=?";
        await runTransectionQuery(connection, insertUserSql, [name.trim(), email.trim(), phone, status, editId]);
        const franchiseSql = "UPDATE tbl_delevery_boy_details set franchise_id=?, state=?, district=? where user_id=?";
        await runTransectionQuery(connection, franchiseSql, [franchiseId, state, district, editId]);
        await commit(connection);
        return { status: true, msg: "Delivery boy updated successfully.", responseObj: {} };
      } catch (e) {
        await rollback(connection);
        return { status: false, msg: "Unable to update delivery boy. Please try again", responseObj: {} };
      } finally {
        console.log("came in connection release");
        connection.release();
      }
    } else {
      return { status: false, msg: "Permission denied to update delivery boy", responseObj: {} };
    }
  } catch (e) {
    return { status: false, msg: "Please try again.", responseObj: {} };
  }
};

const deliveryList = async (user_id, role_id, date) => {
  try {
    const sql = `select o.*, od.id as item_id, od.quantity, od.product_id, od.price, od.unit, od.count, od.delivery_date, od.delivery_status, p.name as product_name
    from tbl_orders o
    left join tbl_order_details od
    on o.id = od.order_id 
    left join tbl_products p on p.id=od.product_id
    where od.delivery_boy_id=? and od.delivery_date=? and od.delivery_status != 3 and od.delivery_status != 4`;
    const response = await runMysqlQueryWithParam(sql, [user_id, date]);
    const list = [];
    if (response && response.length) {
      response.forEach((item) => {
        const check = list.some((obj) => obj.id === item.id);
        if (!check) {
          const itemList = response.filter((obj) => obj.id === item.id);
          list.push({ id: item.id, itemList });
        }
      });
    }
    return { status: true, msg: "Delivery list fetched successfully.", responseObj: list };
  } catch (e) {
    return { status: false, msg: "Unable to get delivery list. Please try again", responseObj: [] };
  }
};

const getDeliveryBoyOnId = async (user_id, role_id, id) => {
  console.log("idid = ", id);
  try {
    if (role_id != 1 && role_id != 2) {
      return { status: false, msg: "User not authorized", responseObj: [] };
    }
    let whereClause = `where u.id=?`;
    let params = [id];
    if (role_id == 2) {
      whereClause = `where u.id=? and d.franchise_id=?`;
      params = [id, user_id];
    }
    let sql = `select u.*, d.user_id, d.franchise_id, d.state, d.district, f.franchise_name from tbl_users u left join tbl_delevery_boy_details d on u.id=d.user_id left join tbl_franchise_details f on d.franchise_id=f.user_id ${whereClause}`;
    const response = await runMysqlQueryWithParam(sql, params);
    console.log("responseresponse = ", response);
    let data = {};
    if (response.length) {
      data = response[0];
    }
    return { status: true, msg: "Delivery list fetched successfully.", responseObj: data };
  } catch (e) {
    return { status: false, msg: "Unable to get delivery list. Please try again", responseObj: [] };
  }
};

const deleteDeliveryBoy = async (id, role_id, user_id) => {
  try {
    if (role_id == 1 || role_id == 2) {
      let whereClause = ``;
      const assignCheckSql = `select id from tbl_order_details where delivery_boy_id=? and delivery_status=2`;
      const assignCheck = runMysqlQueryWithParam(assignCheckSql, [id]);
      if (assignCheck.length) {
        return { status: false, msg: "Cannot delete delivery boy. Delivery boy is already assigned for a order delivery. ", responseObj: [] };
      }
      if (role_id == 2) {
        const checkSql = `select u.id, d.user_id from tbl_users u left join tbl_delevery_boy_details d where d.franchise_id=? and u.id=?`;
        const check = runMysqlQueryWithParam(checkSql, [user_id, id]);
        if (check.length) {
          const sql = `update tbl_users set status=4 where id=?`;
          runMysqlQueryWithParam(sql, [id]);
        } else {
          return { status: false, msg: "Permission denied to delete franchise details", responseObj: [] };
        }
      } else {
        const sql = `update tbl_users set status=4 where id=?`;
        runMysqlQueryWithParam(sql, [id]);
      }
      return { status: true, msg: "delivery boy deleted successfully", responseObj: {} };
    } else {
      return { status: false, msg: "Permission denied to delete delevery boy details", responseObj: [] };
    }
  } catch (e) {
    return { status: false, msg: "Please try again" };
  }
};

module.exports = { getAllDeleveryBoyList, addDeleveryBoy, deliveryList, getDeliveryBoyOnId, deleteDeliveryBoy, editDeleveryBoy };
