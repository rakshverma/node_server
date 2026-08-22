const productService = require("../../services/user/product.service");
const response = require("../../utils/commonResponse");

const getCategoryList = async (req, res) => {
  const list = await productService.getCategoryList();
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const getProductList = async (req, res) => {
  const { pinCode } = req.params;
  const list = await productService.getProductList(pinCode);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const getProductReview = async (req, res) => {
  const { productId } = req.query;
  const list = await productService.getProductReview(productId);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, []);
};

const getShippingCostOnPin = async (req, res) => {
  const { pinCode } = req.params;
  const list = await productService.getShippingCostOnPin(pinCode);
  if (list.status) response.send(res, 200, 1, list.msg, list.responseObj);
  else response.send(res, 500, 0, list.msg, 0);
};

module.exports = {
  getCategoryList,
  getProductList,
  getProductReview,
  getShippingCostOnPin,
};
