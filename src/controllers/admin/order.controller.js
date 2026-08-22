const orderService = require("../../services/admin/order.service");
const response = require("../../utils/commonResponse");

const getAllOrders = async (req, res) => {
  const { user_id, role_id } = req;
  const list = await orderService.getAllOrders(user_id, role_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getAllOrdersByFranchise = async (req, res) => {
  const { user_id, role_id } = req;
  const { id } = req.query;
  const list = await orderService.getAllOrdersByFranchise(user_id, role_id, id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const getDeleveryboyListOnFranchise = async (req, res) => {
  const { user_id, role_id } = req;
  const { franchiseId } = req.query;
  const list = await orderService.getDeleveryboyListOnFranchise(user_id, role_id, franchiseId);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const updateDeleveryboyWithStatus = async (req, res) => {
  const { role_id, user_id } = req;
  const { deleveryboyId, status, orderId } = req.body;
  const validate = await orderService.validateUpdatingOrder({ role_id, user_id, deleveryboyId, status, orderId });
  if (!validate.status) return response.send(res, 500, 0, validate.msg, {});
  const update = await orderService.updateDeleveryboyWithStatus({ deleveryboyId, status, orderId });
  if (update.status) return response.send(res, 200, 1, list.msg, {});
  else return response.send(res, 500, 0, list.msg, {});
};

const getOrderOnID = async (req, res) => {
  const { user_id, role_id } = req;
  const { id } = req.params;
  const list = await orderService.getOrderOnID(user_id, role_id, id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const updateOrderDeliveryStatus = async (req, res) => {
  const { user_id, role_id } = req;
  const { id, status } = req.body;
  const list = await orderService.updateOrderDeliveryStatus(user_id, role_id, id, status);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const getFranchiseListOnOrder = async (req, res) => {
  const { user_id, role_id } = req;
  const { orderId } = req.params;
  const list = await orderService.getFranchiseListOnOrder(user_id, role_id, orderId);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const updateDeliveryBoyOnOrder = async (req, res) => {
  const { user_id, role_id } = req;
  const { boyId, orderId, orderDetailsId } = req.body;
  const list = await orderService.updateDeliveryBoyOnOrder(user_id, role_id, boyId, orderId, orderDetailsId);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const cancelOrder = async (req, res) => {
  const { user_id, role_id } = req;
  const { id } = req.params;
  const list = await orderService.cancelOrder(user_id, role_id, id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const cancelOrderItems = async (req, res) => {
  const { user_id, role_id } = req;
  const list = await orderService.cancelOrderItems(user_id, role_id, req.body);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const completeOrderItems = async (req, res) => {
  const { user_id, role_id } = req;
  const list = await orderService.completeOrderItems(user_id, role_id, req.body);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const cancelOrderOnItemId = async (req, res) => {
  const { user_id, role_id } = req;
  const { orderId, itemId, mainOrderCancel } = req.body;
  const list = await orderService.cancelOrderOnItemId(user_id, role_id, orderId, itemId, mainOrderCancel);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const updateAdminNotes = async (req, res) => {
  const { user_id, role_id } = req;
  const { orderId, adminNotes } = req.body;
  const list = await orderService.updateAdminNotes(user_id, role_id, orderId, adminNotes);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

const updateDeliveryDate = async (req, res) => {
  const { user_id, role_id } = req;
  const { id, itemId, date } = req.body;
  const list = await orderService.updateDeliveryDate(user_id, role_id, id, itemId, date);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, {});
};

module.exports = {
  getAllOrders,
  getDeleveryboyListOnFranchise,
  updateDeleveryboyWithStatus,
  getOrderOnID,
  updateOrderDeliveryStatus,
  getFranchiseListOnOrder,
  updateDeliveryBoyOnOrder,
  cancelOrder,
  getAllOrdersByFranchise,
  cancelOrderItems,
  cancelOrderOnItemId,
  completeOrderItems,
  updateAdminNotes,
  updateDeliveryDate,
};
