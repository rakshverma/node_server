const userService = require("../../services/user/user.service");
const response = require("../../utils/commonResponse");

const getUserInfo = async (req, res) => {
  const { user_id, role_id } = req;
  const user = await userService.getCurrentUser(user_id, role_id);
  if (user.status) response.send(res, 200, 1, user.msg, user.responseObj);
  else response.send(res, 500, 0, user.msg, {});
};

const getUserDistrict = async (req, res) => {
  const { pincode } = req.params;
  const user = await userService.getUserDistrict(pincode);
  if (user.status) response.send(res, 200, 1, user.msg, user.responseObj);
  else response.send(res, 500, 0, user.msg, {});
};

const getDistrictList = async (req, res) => {
  const list = await userService.getDistrictList();
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const addUserAddress = async (req, res) => {
  const { user_id } = req;
  const { street, state, district, pincode, landmark } = req.body;
  const list = await userService.addUserAddress(street, state, district, pincode, landmark, user_id);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const updateUserAccount = async (req, res) => {
  const { user_id } = req;
  const { formData, email } = req.body;
  const list = await userService.updateUserAccount(formData, email);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

module.exports = {
  getUserInfo,
  getUserDistrict,
  getDistrictList,
  addUserAddress,
  updateUserAccount,
};
