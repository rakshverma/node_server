const productService = require("../../services/admin/product.service");
const response = require("../../utils/commonResponse");

const addProduct = async (req, res) => {
  try {
    const files = req?.files || [];
    if (files.length === 0) {
      return response.send(res, 400, 0, "Please upload at least one product image.", {});
    } else {
      console.log("REQ BODY = ", req.body);
      const checkValid = await productService.validateAddProducts(req.body, files);
      if (!checkValid.status) return response.send(res, 400, 0, checkValid.msg, {});
      const save = await productService.addProduct(req.body, files);
      console.log("save = ", save);
      if (save.status) return response.send(res, 200, 1, save.msg, {});
      else return response.send(res, save.statusCode || 500, 0, save.msg, {});
    }
  } catch (e) {
    response.send(res, 500, 0, "Please try again.", {});
  }
};

const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const files = req?.files || [];
    if (!productId) return response.send(res, 400, 0, "Unable to edit product. Please try again.", {});
    const checkValid = await productService.validateAddProducts(req.body, files);
    if (!checkValid.status) return response.send(res, 400, 0, checkValid.msg, {});
    const save = await productService.editProduct(req.body, files, productId);
    console.log("save = ", save);
    if (save.status) return response.send(res, 200, 1, save.msg, {});
    else return response.send(res, save.statusCode || 500, 0, save.msg, {});
  } catch (e) {
    response.send(res, 500, 0, "Please try again.", {});
  }
};

const getAllProducts = async (req, res) => {
  const { user_id, role_id } = req;
  const { franchiseId } = req.query;
  const list = await productService.getProductList(user_id, role_id, franchiseId);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const priceeditinfo = async (req, res) => {
  console.log("req.params = ", req.params);
  const { productId, distributerId } = req.params;
  const { user_id, role_id } = req;
  if (!productId || !distributerId) return response.send(res, 400, 0, "Invalid Request. Unable to fetch price info", {});
  const validUser = await productService.validateUserForPriceInfo({
    productId,
    distributerId,
    user_id,
    role_id,
  });
  console.log("validUser = ", validUser);
  if (!validUser.status) return response.send(res, 403, 0, validUser.msg, {});
  const priceInfo = await productService.getEditPriceInfo({
    productId,
    distributerId,
    user_id,
    role_id,
  });
  if (priceInfo.status) response.send(res, 200, 1, "", priceInfo.responseObj);
  else return response.send(res, 500, 0, priceInfo.msg, {});
};

const getProductPriceOnFranchise = async (req, res) => {
  const { distributerId } = req.params;
  const { user_id, role_id } = req;
  if (!distributerId) return response.send(res, 400, 0, "Please try again.", {});
  const productList = await productService.getProductPriceOnFranchise(distributerId);
  if (productList.status) response.send(res, 200, 1, "", productList.responseObj);
  else return response.send(res, 500, 0, productList.msg, {});
};

const updateProductPrice = async (req, res) => {
  const { productId, distributerId } = req.params;
  const { user_id, role_id } = req;
  console.log(req.body);
  const data = req.body;
  if (!distributerId || !productId) return response.send(res, 400, 0, "Invalid Request. Try again.", {});
  const updateProduct = await productService.updateProductPrice({ productId, distributerId, user_id, role_id, data });
  if (updateProduct.status) response.send(res, 200, 1, "", {});
  else return response.send(res, 500, 0, updateProduct.msg, {});
};

const getProductReviews = async (req, res) => {
  const { role_id } = req;
  const list = await productService.getProductReviews(role_id);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const updateProductStatus = async (req, res) => {
  const { productId, status } = req.params;
  const list = await productService.updateProductStatus(productId, status);
  if (list.status) return response.send(res, 200, 1, list.msg, list.responseObj);
  else return response.send(res, 500, 0, list.msg, []);
};

const deleteReview = async (req, res) => {
  const { role_id, user_id } = req;
  const { id } = req.params;
  const list = await productService.deleteReviews(id, role_id, user_id);
  if (list.status) return response.send(res, 200, 1, list.msg, {});
  else return response.send(res, 500, 0, list.msg, {});
};

module.exports = {
  addProduct,
  editProduct,
  getAllProducts,
  priceeditinfo,
  getProductPriceOnFranchise,
  updateProductPrice,
  getProductReviews,
  updateProductStatus,
  deleteReview,
};
