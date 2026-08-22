const authService = require("../../services/user/auth.service");
const response = require("../../utils/commonResponse");

const register = async (req, res) => {
  const postData = req.body;
  const insert = await authService.register(postData);
  if (insert.status) return response.send(res, 200, 1, insert.msg, insert.responseObj);
  else return response.send(res, insert.statusCode || 400, 0, insert.msg, insert.responseObj);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const validateLogin = await authService.validateLogin(email, password);
  // FIX: Added 'return' to prevent double-response when validation fails
  if (!validateLogin.status) return response.send(res, 400, 0, validateLogin.msg, {});
  const login = await authService.doLogin(email, password);
  if (login.status) return response.send(res, 200, 1, login.msg, login.responseObj);
  else return response.send(res, login.statusCode || 401, 0, login.msg, {});
};

const forgotPassword = async (req, res) => {
  console.log("req.body = ", req.body);
  const { email } = req.body;
  const validate = await authService.validateForgotPassword(email);
  // FIX: Added 'return' to prevent double-response when validation fails
  if (!validate.status) return response.send(res, 500, 0, validate.msg, {});
  const fPass = await authService.doForgotPassword(email);
  if (fPass.status) return response.send(res, 200, 1, fPass.msg, {});
  else return response.send(res, 500, 0, fPass.msg, {});
};

module.exports = {
  register,
  login,
  forgotPassword,
};
