const authService = require("../../services/admin/auth.service");
const response = require("../../utils/commonResponse");

const register = async (req, res) => {
  const postData = req.body;
  const insert = await authService.registerNewUser(postData);
  if (insert) {
    response.send(res, 200, 1, "user info inserted successfully", {});
  } else {
    response.send(res, 500, 0, "Could not insert user data", {});
  }
};

const login = async (req, res) => {
  console.log("req.body = ", req.body);
  const { email, password } = req.body;
  const validateLogin = await authService.validateLogin({ email, password });
  if (!validateLogin.status) return response.send(res, 400, 0, validateLogin.msg, {});
  const login = await authService.doLogin({ email, password });
  if (login.status) response.send(res, 200, 1, login.msg, login.responseObj);
  else response.send(res, login.statusCode || 401, 0, login.msg, {});
};

const forgotPassword = async (req, res) => {
  console.log("req.body = ", req.body);
  const { email } = req.body;
  const validate = await authService.validateForgotPassword({ email });
  if (!validate.status) return response.send(res, 400, 0, validate.msg, {});
  const fPass = await authService.doForgotPassword({ email });
  if (fPass.status) response.send(res, 200, 1, fPass.msg, {});
  else response.send(res, fPass.statusCode || 400, 0, fPass.msg, {});
};

module.exports = {
  register,
  login,
  forgotPassword,
};
