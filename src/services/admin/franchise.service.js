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

const getFranchiseList = async (user_id, role_id) => {
  try {
    if (role_id === 1) {
      const sql = `SELECT u.name, u.status, u.email, u.phone_number, u.inserted_at, u.modified_at, f.*
                         FROM tbl_users u
                         LEFT JOIN tbl_franchise_details f 
                         ON u.id = f.user_id where u.status!=3 and u.status!=4 and u.role_id=2 order by id desc`;
      const select = await runMysqlQuery(sql);
      return { status: true, msg: "", responseObj: select };
    } else {
      return { status: false, msg: "User Not Authorized" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong" };
  }
};

const getDistrictList = async () => {
  try {
    const sql = `SELECT DISTINCT(district) FROM mst_pin_codes ORDER BY district ASC`;
    const list = await runMysqlQuery(sql);
    return { status: true, msg: "", responseObj: list };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to fetch district list" };
  }
};

const getPinCodeList = async (district) => {
  try {
    const sql = `SELECT DISTINCT(pin_code) FROM mst_pin_codes WHERE district=? ORDER BY pin_code ASC`;
    const list = await runMysqlQueryWithParam(sql, [district]);
    const checkSql = `SELECT zip_codes FROM tbl_franchise_details WHERE district=?`;
    const checkList = await runMysqlQueryWithParam(checkSql, [district]);
    let addedZips = [];
    if (checkList.length) {
      checkList.forEach((item) => {
        addedZips = item.zip_codes && [...addedZips, ...JSON.parse(item.zip_codes)];
      });
    }
    const zipCodesList = list.filter((obj) => addedZips.indexOf(obj.pin_code) === -1);
    return { status: true, msg: "", responseObj: zipCodesList };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Unable to fetch pincode list" };
  }
};

const addFranchise = async (data, user_id, role_id) => {
  try {
    const { name, phone, email, franchiseName, status, state, district, zipCodes } = data;
    const randomPassword = bcrypt.hashSync("test123", config.saltRounds);
    if (role_id === 1) {
      const checkSql = `SELECT u.email, u.phone_number, f.franchise_name 
                        FROM tbl_users u
                        LEFT JOIN
                        tbl_franchise_details f
                        ON
                        u.id = f.user_id
                        WHERE 
                        u.email=? OR u.phone_number=? OR f.franchise_name=?`;
      const check = await runMysqlQueryWithParam(checkSql, [email, phone, franchiseName]);
      if (check.length) {
        const err = [];
        check.forEach((element) => {
          if (element.email == email.trim()) err.indexOf("Email") === -1 ? err.push("Email") : null;
          if (element.phone_number == phone) err.indexOf("Phone No.") === -1 ? err.push("Phone No.") : null;
          if (element.franchise_name == franchiseName.trim()) err.indexOf("Franchise Name") === -1 ? err.push("Franchise Name") : null;
        });
        return { status: false, msg: `${err.toString()} already exists`, responseObj: {} };
      }
      const connection = await mysqlConnect();
      try {
        await beginTransaction(connection);
        const insertUserSql = "INSERT INTO tbl_users (role_id, name, password, email, phone_number, status, added_by) VALUES (?, ?, ? , ?, ?, ?, ?)";
        const insertUser = await runTransectionQuery(connection, insertUserSql, [
          2,
          name.trim(),
          randomPassword,
          email.trim(),
          phone,
          status,
          user_id,
        ]);
        const insertId = insertUser.insertId;
        const franchiseSql = "INSERT INTO tbl_franchise_details (user_id, franchise_name, state, district, zip_codes) VALUES (?, ?, ?, ?, ?)";
        const insertFranchiseDetails = await runTransectionQuery(connection, franchiseSql, [
          insertId,
          franchiseName.trim(),
          state,
          district,
          zipCodes,
        ]);
        await commit(connection);
        connection.release();
        return { status: true, msg: "Franchise added successfully.", responseObj: {} };
      } catch (e) {
        await rollback(connection);
        connection.release();
        return { status: false, msg: "Unable to add franchise. Please try again", responseObj: {} };
      }
    } else {
      return { status: false, msg: "Permission denied to add franchise", responseObj: {} };
    }
  } catch (e) {
    console.log("add franchise error = ", e);
    return { status: false, msg: "Unable to add franchise. Please try again", responseObj: {} };
  }
};

const editFranchise = async (data, user_id, role_id) => {
  try {
    const { name, phone, email, franchiseName, status, state, district, zipCodes } = data.data;
    const editId = data.editId;
    if (role_id === 1) {
      const checkSql = `SELECT u.email, u.phone_number, f.franchise_name 
                        FROM tbl_users u
                        LEFT JOIN
                        tbl_franchise_details f
                        ON
                        u.id = f.user_id
                        WHERE u.id != ? AND u.role_id = 2 AND
                        (u.email=? OR f.franchise_name=?)`;
      const check = await runMysqlQueryWithParam(checkSql, [editId, email, phone, franchiseName]);
      console.log("check = ", check);
      console.log("editId = ", editId, email, phone, franchiseName);
      if (check.length) {
        const err = [];
        check.forEach((element) => {
          if (element.email == email.trim()) err.indexOf("Email") === -1 ? err.push("Email") : null;
          if (element.phone_number == phone) err.indexOf("Phone No.") === -1 ? err.push("Phone No.") : null;
          if (element.franchise_name == franchiseName.trim()) err.indexOf("Franchise Name") === -1 ? err.push("Franchise Name") : null;
        });
        return { status: false, msg: `${err.toString()} already exists`, responseObj: {} };
      }
      const connection = await mysqlConnect();
      try {
        await beginTransaction(connection);
        const insertUserSql = "update tbl_users set name=?, email=?, phone_number=?, status=? where id=?";
        const insertUser = await runTransectionQuery(connection, insertUserSql, [name.trim(), email.trim(), phone, status, editId]);
        const insertId = insertUser.insertId;
        const franchiseSql = "update tbl_franchise_details set franchise_name=?, state=?, district=?, zip_codes=? where user_id=?";
        let newZipCodes = zipCodes;
        if (status == 0) {
          newZipCodes = JSON.stringify([]);
        }

        console.log("newZipCodes = ", newZipCodes);
        const insertFranchiseDetails = await runTransectionQuery(connection, franchiseSql, [
          franchiseName.trim(),
          state,
          district,
          newZipCodes,
          editId,
        ]);
        await commit(connection);
        connection.release();
        return { status: true, msg: "Franchise updated successfully.", responseObj: {} };
      } catch (e) {
        await rollback(connection);
        connection.release();
        return { status: false, msg: "Unable to edit franchise. Please try again", responseObj: {} };
      }
    } else {
      return { status: false, msg: "Permission denied to add franchise", responseObj: {} };
    }
  } catch (e) {
    console.log("add franchise error = ", e);
    return { status: false, msg: "Unable to edit franchise. Please try again", responseObj: {} };
  }
};

const getAllRequest = async (role_id) => {
  try {
    if (role_id === 1) {
      const sql = `SELECT * FROM tbl_franchise_requests ORDER BY id DESC`;
      const list = await runMysqlQuery(sql);
      return { status: true, msg: "Request list fetched successfully", responseObj: list };
    } else {
      return { status: false, msg: "Permission denied to add franchise", responseObj: {} };
    }
  } catch (e) {
    return { status: true, msg: "Unable to fetch request list.", responseObj: list };
  }
};

const getAllFranchiseOnRole = async (role_id, user_id) => {
  try {
    if (role_id === 1) {
      const sql = `SELECT u.id, u.role_id, u.name, u.status, u.email, u.phone_number, u.inserted_at, u.modified_at, f.franchise_name, f.state, f.district,f.zip_codes
                         FROM tbl_users u
                         LEFT JOIN tbl_franchise_details f 
                         ON u.id = f.user_id where u.status !=3 and u.status != 4 and (u.role_id=1 or role_id=2) ORDER BY u.id ASC`;
      const select = await runMysqlQuery(sql);
      console.log("select = ", select);
      return { status: true, msg: "Franchise list on role fetched successfully", responseObj: select };
    } else if (role_id === 2) {
      const sql = `SELECT u.id, u.name, u.status, u.email, u.phone_number, u.inserted_at, u.modified_at, f.franchise_name, f.state, f.district,f.zip_codes
                         FROM tbl_users u
                         LEFT JOIN tbl_franchise_details f 
                         ON u.id = f.user_id where u.id =? and u.status !=3 and u.status!=4`;
      const select = await runMysqlQueryWithParam(sql, [user_id]);
      console.log("select = ", select);
      return { status: true, msg: "Franchise list on role fetched successfully", responseObj: select };
    } else {
      return { status: false, msg: "Permission denied to add franchise", responseObj: {} };
    }
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Something went wrong" };
  }
};

const getShippingCostListOnId = async (franchiseId, role_id, user_id) => {
  try {
    if (role_id !== 1 && role_id !== 2) {
      return { status: false, msg: "Permission denied to add shipping cost", responseObj: [] };
    }
    const sql = `select zip_codes from tbl_franchise_details where user_id=?`;
    const result = await runMysqlQueryWithParam(sql, [franchiseId]);
    if (result.length) {
      const zipList = JSON.parse(result[0].zip_codes);
      const shipSql = `select user_id, pin_code, shipping_cost from tbl_shipping_cost where user_id=?`;
      const shipList = await runMysqlQueryWithParam(shipSql, [franchiseId]);
      const list = [];
      zipList.forEach((item, i) => {
        const shipArr = shipList.filter((o) => o.pin_code === item);
        if (shipArr.length) {
          list.push({
            pin_code: shipArr[0].pin_code,
            shipping_cost: shipArr[0].shipping_cost,
          });
        } else {
          list.push({
            pin_code: item,
            shipping_cost: 0,
          });
        }
      });
      return { status: true, msg: "shipping list fetched successfully", responseObj: list };
    } else {
      return { status: true, msg: "shipping list fetched successfully", responseObj: [] };
    }
  } catch (e) {
    return { status: false, msg: "Something went wrong" };
  }
};

const updateShippingCostListOnId = async (formData, franchiseId, role_id, user_id) => {
  try {
    if ((role_id !== 1 && role_id !== 2) || (role_id === 2 && user_id !== parseInt(franchiseId))) {
      return { status: false, msg: "Permission denied to add shipping cost", responseObj: [] };
    }
    console.log("formData = ", formData);
    const values = formData?.pinCodes.map(({ pin_code, shipping_cost }) => [franchiseId, `${pin_code}`.trim(), Number(shipping_cost) || 0]);
    const sql = `
      INSERT INTO tbl_shipping_cost (user_id, pin_code, shipping_cost)
      VALUES ?
      ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), shipping_cost = VALUES(shipping_cost)
    `;
    await runMysqlQueryWithParam(sql, [values]);
    return { status: true, msg: "shipping cost updated successfully", responseObj: {} };
  } catch (e) {
    console.log("ERROR -= ", e);
    return { status: false, msg: "Something went wrong" };
  }
};

const getFranchiseDetailsOnId = async (franchiseId, role_id, user_id) => {
  try {
    if ((role_id !== 1 && role_id !== 2) || (role_id === 2 && user_id !== parseInt(franchiseId))) {
      return { status: false, msg: "Permission denied to edit franchise details", responseObj: [] };
    }
    const sqlFranchise = `
      select u.*, f.franchise_name, f.state, f.district, f.zip_codes from tbl_users u left join tbl_franchise_details f on u.id=f.user_id where u.id=?
    `;
    const response = await runMysqlQueryWithParam(sqlFranchise, [franchiseId]);
    const sql = `SELECT DISTINCT(pin_code) FROM mst_pin_codes WHERE district=? ORDER BY pin_code ASC`;
    const list = await runMysqlQueryWithParam(sql, [response[0].district]);
    const checkSql = `SELECT zip_codes FROM tbl_franchise_details WHERE district=? AND user_id !=?`;
    const checkList = await runMysqlQueryWithParam(checkSql, [response[0].district, franchiseId]);
    let addedZips = [];
    if (checkList.length) {
      checkList.forEach((item) => {
        addedZips = item.zip_codes && [...addedZips, ...JSON.parse(item.zip_codes)];
      });
    }
    const zipCodesList = list.filter((obj) => addedZips.indexOf(obj.pin_code) === -1);
    return { status: true, msg: "franchise details successfully", responseObj: { franchiseDetails: response[0], pinCodeList: zipCodesList } };
  } catch (e) {
    console.log("ERROR -= ", e);
    return { status: false, msg: "Something went wrong" };
  }
};

const deleteFranchise = async (franchiseId, role_id, user_id) => {
  try {
    if (role_id === 1) {
      const sql = `update tbl_users set status=3 where id=?`;
      await runMysqlQueryWithParam(sql, [franchiseId]);
      const sqlDetails = `update tbl_franchise_details set zip_codes=? where user_id=?`;
      await runMysqlQueryWithParam(sqlDetails, [JSON.stringify([]), franchiseId]);
      return { status: true, msg: "franchise deleted successfully", responseObj: {} };
    } else {
      return { status: false, msg: "Permission denied to delete franchise details", responseObj: [] };
    }
  } catch (e) {
    return { status: false, msg: "Something went wrong" };
  }
};

module.exports = {
  getFranchiseList,
  getDistrictList,
  getPinCodeList,
  addFranchise,
  getAllRequest,
  getAllFranchiseOnRole,
  getShippingCostListOnId,
  updateShippingCostListOnId,
  getFranchiseDetailsOnId,
  editFranchise,
  deleteFranchise,
};
