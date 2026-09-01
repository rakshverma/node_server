const orderService = require("../../services/user/order.service");
const response = require("../../utils/commonResponse");

const addOrderDetails = async (req, res) => {
  const { formData, cartId, deliveryDates, userId, isPincodeChanged, shipping_cost } = req.body;
  if (!cartId) return response.send(res, 500, 0, "Unable to confirm order. Please check your shopping cart.", {});
  const order = await orderService.addOrderDetails(formData, cartId, deliveryDates, userId, isPincodeChanged, shipping_cost);
  if (order.status) response.send(res, 200, 1, order.msg, order.responseObj);
  else response.send(res, 500, 0, order.msg, order.responseObj);
};

const getOrderList = async (req, res) => {
  const { refId, pid } = req.query;
  const { user_id, role_id } = req;
  const list = await orderService.getOrderList(refId, user_id, role_id, pid);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};
const addReview = async (req, res) => {
  const { stars, review, pid } = req.body;
  const { user_id, role_id } = req;
  if (!user_id || role_id != 4) return response.send(res, 500, 0, "Can not add review. please login again.", {});
  const list = await orderService.addReview(stars, review, pid, user_id, role_id);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, {});
};

const getReviews = async (req, res) => {
  const { user_id, role_id } = req;
  if (!user_id || role_id != 4) return response.send(res, 500, 0, "Could not fetch review. please login again.", {});
  const list = await orderService.getReviewList(user_id);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const deleteReview = async (req, res) => {
  const { id } = req.body;
  const { user_id, role_id } = req;
  if (!user_id || role_id != 4) return response.send(res, 500, 0, "Can not delete review. please login again.", {});
  const list = await orderService.deleteReview(id, user_id);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, {});
};

const getOrderItemOnId = async (req, res) => {
  const { refId } = req.query;
  const list = await orderService.getOrderItemOnId(refId);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const cancelFutureOrder = async (req, res) => {
  const { orderId } = req.body;
  const { user_id, role_id } = req;
  const list = await orderService.cancelFutureOrder(orderId, user_id, role_id);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, list.responseObj);
};

module.exports = {
  addOrderDetails,
  getOrderList,
  addReview,
  getReviews,
  deleteReview,
  getOrderItemOnId,
  cancelFutureOrder,
};
