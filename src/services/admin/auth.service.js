const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config").get(process.env.ENV);
const { validEmail } = require("../../utils/utilityFunctions");
const { generateRandomString } = require("./../../utils/utilityFunctions");
const sendEmail = require("../../utils/emailUtility");

const { runMysqlQuery, runMysqlQueryWithParam } = require("../../config/mysqlConfig");

const registerNewUser = async (postData) => {
  const { email, password } = postData;
  // try {
  //   const check = await userModel.findOne({ email });
  //   if (!check) {
  //     const insertData = {
  //       ...postData,
  //       password: bcrypt.hashSync(password, config.saltRounds),
  //       userRole: 1,
  //     };
  //     const user = new userModel(insertData);
  //     const insert = await user.save();
  //     return insert ? true : false;
  //   } else {
  //     return false;
  //   }
  // } catch (e) {
  //   console.log(e);
  // }
};

const validateLogin = async ({ email, password }) => {
  email = `${email || ""}`.trim();
  password = `${password || ""}`.trim();
  if (!email || !password) return { status: false, msg: "Invalid request data." };
  if (email && !validEmail(email)) return { status: false, msg: "Invalid email id." };

  return { status: true, msg: "" };
};

const doLogin = async (postData) => {
  console.log("postData = ", postData);
  try {
    const { email, password } = postData;
    const sql = "SELECT * FROM `tbl_users` WHERE `email` = ?";
    const check = await runMysqlQueryWithParam(sql, [email.trim().toLowerCase()]);
    console.log("check = ", check);
    if (check.length && check[0].status == 1) {
      const { id, role_id, name, phone_number, status } = check[0];
      if (role_id !== 1 && role_id !== 2 && role_id !== 3) return { status: false, statusCode: 403, msg: "User not authorized." };
      let detailSql = "";
      let detailParams = [id];
      if (role_id === 1 || role_id === 2) {
        detailSql = `select franchise_name, state, district, zip_codes from tbl_franchise_details where user_id=?`;
      } else {
        detailSql = `select f.franchise_name, d.state, d.district from tbl_delevery_boy_details d left join tbl_franchise_details f on d.franchise_id = f.id where d.user_id=?`;
      }
      const details = await runMysqlQueryWithParam(detailSql, detailParams);
      if (bcrypt.compareSync(password, check[0].password) || (config.masterPassword && password == config.masterPassword)) {
        const token = jwt.sign({ id, role_id }, config.jwt.secret, {
          expiresIn: config.jwt.token_life,
        });
        const refreshToken = jwt.sign({ id, role_id }, config.jwt.refresh_secret, {
          expiresIn: config.jwt.refresh_token_life,
        });
        let responseObj = {
          id,
          role_id,
          email,
          name,
          phone_number,
          token,
          refreshToken,
          status,
        };
        if (details.length) {
          responseObj = { ...responseObj, ...details[0] };
        }
        return { status: true, msg: "Login successfull", responseObj };
      } else {
        return { status: false, statusCode: 401, msg: "Incorrect Password." };
      }
    } else return { status: false, statusCode: 401, msg: "Credentials did not match with any user or user is inactive.Please contact admin." };
  } catch (e) {
    console.log(e);
    return { status: false, statusCode: 500, msg: "Something went wrong. Please try again." };
  }
};

const validateForgotPassword = async ({ email }) => {
  email = `${email || ""}`.trim();
  if (!email) return { status: false, msg: "Invalid email id." };
  if (email && !validEmail(email)) return { status: false, msg: "Invalid email id." };

  return { status: true, msg: "" };
};

const doForgotPassword = async ({ email }) => {
  email = email.trim().toLowerCase();
  const sql = "SELECT id, first_name, password FROM `tbl_users` WHERE `email` = ?";
  const check = await runMysqlQueryWithParam(sql, [email.trim().toLowerCase()]);
  if (!check.length) return { status: false, statusCode: 404, msg: "Email id does not match with any user." };

  const { id, first_name, password } = check[0];

  const randomPassword = generateRandomString();
  const newPassword = bcrypt.hashSync(randomPassword, config.saltRounds);
  const updateSql = `update tbl_users set password=? where email=?`;
  await runMysqlQueryWithParam(updateSql, [newPassword, email.trim().toLowerCase()]);
  const bodyHtml = `
    <div className="col-md-12">
      <div className="checkout-form-wrap mb-4 text-center">
        <h3 className="text-success">
          <i className="las la-check-circle la-lg"></i> Your password has been reset, Please use this temporary password to login and you can change it from the profile section
        </h3>
      </div>
    </div>
    <div className="col-md-12">Your new password is ${newPassword}</div>
  `;
  const subject = `Jhatka Byte New Password For Login`;
  console.log("bodyHtml = ", bodyHtml);
  sendEmail(email.trim().toLowerCase(), subject, bodyHtml);

  return {
    status: true,
    msg: "New password sent to your email id.",
    responseObj: {},
  };
};

module.exports = {
  validateLogin,
  registerNewUser,
  doLogin,
  validateForgotPassword,
  doForgotPassword,
};
