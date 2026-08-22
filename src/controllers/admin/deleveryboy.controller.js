const deleveryboyService = require("../../services/admin/deleveryboy.service");
const response = require("../../utils/commonResponse");

const getAllDeleveryBoyList = async (req, res) => {
  const { user_id, role_id } = req;
  const list = await deleveryboyService.getAllDeleveryBoyList(user_id, role_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const addDeleveryBoy = async (req, res) => {
  const { user_id, role_id } = req;
  const insert = await deleveryboyService.addDeleveryBoy(req.body, user_id, role_id);
  console.log("insert = ", insert);
  if (insert.status) return response.send(res, 200, 1, insert.msg, {});
  else return response.send(res, 500, 0, insert.msg, {});
};

const editDeleveryBoy = async (req, res) => {
  const { user_id, role_id } = req;
  const { data, editId } = req.body;
  const insert = await deleveryboyService.editDeleveryBoy(data, editId, user_id, role_id);
  console.log("insert = ", insert);
  if (insert.status) return response.send(res, 200, 1, insert.msg, {});
  else return response.send(res, 500, 0, insert.msg, {});
};

const deliveryList = async (req, res) => {
  const { user_id, role_id } = req;
  const { date } = req.query;
  const list = await deleveryboyService.deliveryList(user_id, role_id, date);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getDeliveryBoyOnId = async (req, res) => {
  const { user_id, role_id } = req;
  const { id } = req.params;
  const list = await deleveryboyService.getDeliveryBoyOnId(user_id, role_id, id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const deleteDeliveryBoy = async (req, res) => {
  const { role_id, user_id } = req;
  console.log("req.query = ", req.query);
  const { id } = req.query;
  const list = await deleveryboyService.deleteDeliveryBoy(id, role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, {});
  else return response.send(res, 500, 0, list.msg, []);
};

module.exports = {
  getAllDeleveryBoyList,
  addDeleveryBoy,
  deliveryList,
  getDeliveryBoyOnId,
  deleteDeliveryBoy,
  editDeleveryBoy,
};
