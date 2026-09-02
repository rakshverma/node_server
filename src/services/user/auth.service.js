const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config").get(process.env.ENV);
const { validEmail, validName, validPhone } = require("../../utils/utilityFunctions");
const sendEmail = require("../../utils/emailUtility");
const {
  runMysqlQuery,
  runMysqlQueryWithParam,
  mysqlConnect,
  beginTransaction,
  commit,
  runTransectionQuery,
  rollback,
} = require("../../config/mysqlConfig");

const normalizeSecretCode = (value) => `${value || ""}`.trim().toLowerCase();

const validateSecretCode = (secretCode) => {
  const normalized = normalizeSecretCode(secretCode);
  return normalized.length >= 4 && normalized.length <= 60;
};

const ensureSecretCodeColumn = async () => {
  try {
    const columns = await runMysqlQueryWithParam(
      "SELECT column_name FROM information_schema.columns WHERE table_name=? AND column_name=?",
      ["tbl_users", "secret_code"]
    );
    if (!columns.length) {
      await runMysqlQuery("ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS secret_code varchar(100) DEFAULT NULL");
    }
  } catch (e) {
    console.log("Secret code column check failed:", e);
    throw e;
  }
};

const register = async (data) => {
  try {
    const { name, email, phone, password, secretCode } = data;
    if (!name || (name && !validName(name.trim()))) return { status: false, statusCode: 400, msg: "Name is not valid", responseObj: {} };
    if (!email || (email && !validEmail(email.trim()))) return { status: false, statusCode: 400, msg: "Email is not valid", responseObj: {} };
    if (!phone || (phone && !validPhone(phone.trim()))) return { status: false, statusCode: 400, msg: "Phone number is not valid", responseObj: {} };
    if (!password || (password && password.trim().length < 6))
      return { status: false, statusCode: 400, msg: "Password must be minimum 6 characters", responseObj: {} };
    if (!validateSecretCode(secretCode)) return { status: false, statusCode: 400, msg: "Secret code must be 4 to 60 characters", responseObj: {} };

    await ensureSecretCodeColumn();
    const checkSql = `SELECT email, phone_number from tbl_users WHERE role_id=4 AND (email=? OR phone_number=?)`;
    const check = await runMysqlQueryWithParam(checkSql, [email.toLowerCase().trim(), phone.trim()]);
    console.log("check = ", check);
    if (check.length) {
      const err = [];
      check.forEach((el) => {
        if (el.email == email.trim().toLowerCase()) err.indexOf("Email") === -1 ? err.push("Email") : null;
        if (el.phone_number == phone.trim()) err.indexOf("Phone No.") === -1 ? err.push("Phone No.") : null;
      });
      return { status: false, statusCode: 409, msg: `${err.toString()} already exists`, responseObj: {} };
    }
    const hashedPassword = bcrypt.hashSync(password, config.saltRounds);
    const hashedSecretCode = bcrypt.hashSync(normalizeSecretCode(secretCode), config.saltRounds);
    const connection = await mysqlConnect();
    try {
      await beginTransaction(connection);
      const sql = `INSERT INTO tbl_users SET name=?, email=?, password=?, secret_code=?, role_id=4, phone_number=?`;
      const insert = await runTransectionQuery(connection, sql, [name.trim(), email.toLowerCase().trim(), hashedPassword, hashedSecretCode, phone.trim()]);
      const insertId = insert.insertId;
      const detailSql = `INSERT INTO tbl_user_details SET user_id=?, is_confirmed=1, login_type=1`;
      await runTransectionQuery(connection, detailSql, [insertId]);
      await commit(connection);
      const role_id = 4;
      const newToken = jwt.sign({ id: insertId, role_id }, config.jwt.secret, {
        expiresIn: config.jwt.token_life,
      });
      const refreshToken = jwt.sign({ id: insertId, role_id }, config.jwt.refresh_secret, {
        expiresIn: config.jwt.refresh_token_life,
      });
      const user = {
        id: insertId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone_number: phone.trim(),
        street: "",
        district: "",
        state: "",
        landmark: "",
        pin_code: "",
        status: 1,
        token: newToken,
        refreshToken: refreshToken,
      };
      sendRegistrationEmail(email.toLowerCase().trim(), name.trim()).catch((e) => console.log("Registration email failed:", e));
      return { status: true, msg: "Thank you! for registering with us", responseObj: user };
    } catch (e) {
      console.log(e);
      await rollback(connection);
      return { status: false, statusCode: 500, msg: "Please try again.", responseObj: {} };
    } finally {
      connection.release();
    }
  } catch (e) {
    console.log(e);
    return { status: false, statusCode: 500, msg: "Please try again.", responseObj: {} };
  }
};

async function sendRegistrationEmail(email, name) {
  const subject = "Welcome to Jhatka Bytes!";
  const message = `<p>
    Welcome, ${name}!<br>
  </p>
  <p>
  <p style="padding-top: 20px">Thank You! for registering with us.</p>
  <p style="padding-top: 20px">You can login any time to check your orders.</p>
  </p>`;
  return sendEmail(email, subject, message);
}

const validateLogin = async (email, password) => {
  try {
    if (!email || (email && !validEmail(email))) return { status: false, msg: "Email is not valid", responseObj: {} };
    if (!password || (password && password.length < 6)) return { status: false, msg: "Password should be minimum 6 characters", responseObj: {} };
    else return { status: true };
  } catch (e) {
    return { status: false, msg: "Please try again", responseObj: {} };
  }
};

const validateForgotPassword = async ({ email, secretCode, password, confPassword }) => {
  try {
    if (!email || (email && !validEmail(email))) return { status: false, msg: "Email is not valid", responseObj: {} };
    if (!validateSecretCode(secretCode)) return { status: false, msg: "Secret code is not valid", responseObj: {} };
    if (!password || password.length < 6) return { status: false, msg: "Password should be minimum 6 characters", responseObj: {} };
    if (password !== confPassword) return { status: false, msg: "Passwords do not match", responseObj: {} };
    else return { status: true };
  } catch (e) {
    return { status: false, msg: "Please try again", responseObj: {} };
  }
};

const doLogin = async (emailId, password) => {
  try {
    const checkSql = `SELECT u.id, u.password, u.email, u.phone_number, u.status, u.name, d.street, d.district,d.state, d.landmark, d.pin_code FROM tbl_users u LEFT JOIN tbl_user_details d ON u.id=d.user_id WHERE u.role_id=4 AND u.email=?`;
    const check = await runMysqlQueryWithParam(checkSql, [emailId.toLowerCase().trim()]);
    if (!check.length) return { status: false, statusCode: 401, msg: "Email id not associated with any account", responseObj: {} };
    if (!bcrypt.compareSync(password, check[0].password)) return { status: false, statusCode: 401, msg: "Password entered is incorrect", responseObj: {} };
    const { id, email, name, phone_number, status, street, district, state, landmark, pin_code } = check[0];
    const role_id = 4;
    const newToken = jwt.sign({ id, role_id }, config.jwt.secret, {
      expiresIn: config.jwt.token_life,
    });
    const refreshToken = jwt.sign({ id, role_id }, config.jwt.refresh_secret, {
      expiresIn: config.jwt.refresh_token_life,
    });
    const user = {
      id,
      email,
      name,
      phone_number,
      street,
      district,
      state,
      landmark,
      pin_code,
      status,
      token: newToken,
      refreshToken,
    };
    return { status: true, msg: "User loggedin successfully", responseObj: user };
  } catch (e) {
    console.log(e);
    return { status: false, statusCode: 500, msg: "Please try again", responseObj: {} };
  }
};

const doForgotPassword = async ({ email, secretCode, password }) => {
  try {
    await ensureSecretCodeColumn();
    const sql = `select id, email, name, secret_code from tbl_users where email=? and role_id=4`;
    const check = await runMysqlQueryWithParam(sql, [email.trim().toLowerCase()]);
    if (!check.length) {
      return { status: false, msg: "No user associated with this email id", responseObj: {} };
    }
    if (!check[0].secret_code) {
      return { status: false, msg: "Secret code is not set for this account. Please contact support.", responseObj: {} };
    }
    if (!bcrypt.compareSync(normalizeSecretCode(secretCode), check[0].secret_code)) {
      return { status: false, msg: "Secret code is incorrect", responseObj: {} };
    }

    const updateSql = `update tbl_users set password=? where email=? and role_id=4`;
    const hashedPassword = bcrypt.hashSync(password, config.saltRounds);
    await runMysqlQueryWithParam(updateSql, [hashedPassword, email.trim().toLowerCase()]);
    return { status: true, msg: "Password reset successfully. Please sign in with your new password.", responseObj: {} };
  } catch (e) {
    console.log(e);
    return { status: false, msg: "Please try again", responseObj: {} };
  }
};

module.exports = {
  register,
  validateLogin,
  doLogin,
  doForgotPassword,
  validateForgotPassword,
};
