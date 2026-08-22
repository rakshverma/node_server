const userService = require("../../services/admin/user.service");
const response = require("../../utils/commonResponse");

const getUserInfo = async (req, res) => {
  const { user_id, role_id } = req;
  const user = await userService.getCurrentUser(user_id, role_id);
  console.log("user_id = ", user_id);
  console.log("user = ", user);
  if (user.status) response.send(res, 200, 1, user.msg, user.responseObj);
  else response.send(res, 500, 0, user.msg, {});
};

const getPinCodeOnUser = async (req, res) => {
  const { user_id, role_id } = req;
  const { district } = req.query;
  const user = await userService.getPinCodeOnUser(user_id, role_id, district);
  if (user.status) response.send(res, 200, 1, user.msg, user.responseObj);
  else response.send(res, 500, 0, user.msg, []);
};

const editProfile = async (req, res) => {
  const { user_id, role_id } = req;
  const update = await userService.editProfile(req.body, user_id, role_id);
  console.log("update = ", update);
  if (update.status) return response.send(res, 200, 1, update.msg, {});
  else return response.send(res, 500, 0, update.msg, {});
};

const changePassword = async (req, res) => {
  const { user_id, role_id } = req;
  const update = await userService.changePassword(req.body, user_id, role_id);
  console.log("update = ", update);
  if (update.status) return response.send(res, 200, 1, update.msg, {});
  else return response.send(res, 500, 0, update.msg, {});
};

module.exports = {
  getUserInfo,
  getPinCodeOnUser,
  editProfile,
  changePassword,
};
