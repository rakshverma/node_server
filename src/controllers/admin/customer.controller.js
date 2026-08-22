const customerService = require("../../services/admin/customer.service");
const response = require("../../utils/commonResponse");

const getAllCustomers = async (req, res) => {
  const { user_id, role_id } = req;
  const list = await customerService.getAllCustomers(user_id, role_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 200, 1, list.msg, []);
};

module.exports = { getAllCustomers };
