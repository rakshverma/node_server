const cartService = require("../../services/user/cart.service");
const response = require("../../utils/commonResponse");

const addCartDetails = async (req, res) => {
  const { cartId } = req.body;
  if (!cartId) return response.send(res, 500, 0, "Unable to add to cart.", []);
  const addCart = await cartService.addCartDetails(req.body);
  if (addCart.status) response.send(res, 200, 1, addCart.msg, []);
  else response.send(res, 500, 0, addCart.msg, []);
};

const getCartDetails = async (req, res) => {
  const { cartId, userId } = req.params;
  console.log("kuku", cartId, userId);
  if (!cartId && !userId) return response.send(res, 500, 0, "Unable to get cart details.", {});
  const getCart = await cartService.getCartDetails({ cartId, userId });
  if (getCart.status) response.send(res, 200, 1, getCart.msg, getCart.responseObj);
  else response.send(res, 500, 0, getCart.msg, []);
};

const updateCartDetails = async (req, res) => {
  const { cartId } = req.body;
  if (!cartId) return response.send(res, 500, 0, "Unable to update cart.", []);
  const addCart = await cartService.updateCartDetails(req.body);
  if (addCart.status) response.send(res, 200, 1, addCart.msg, []);
  else response.send(res, 500, 0, addCart.msg, []);
};

const getCartProductDetails = async (req, res) => {
  console.log("cccccc = ");
  const { cartId } = req.params;
  if (!cartId) return response.send(res, 500, 0, "Unable to get cart details.", []);
  const getCart = await cartService.getCartProductDetails(cartId);
  if (getCart.status) response.send(res, 200, 1, getCart.msg, getCart.responseObj);
  else response.send(res, 500, 0, getCart.msg, []);
};

const deleteCartItem = async (req, res) => {
  const { cartId } = req.params;
  if (!cartId) return response.send(res, 500, 0, "Unable to delete cart item.", []);
  const remove = await cartService.removeCartItem(cartId, req.body);
  if (remove.status) response.send(res, 200, 1, remove.msg, []);
  else response.send(res, 500, 0, remove.msg, []);
};

const removeCart = async (req, res) => {
  const { cartId } = req.params;
  if (!cartId) return response.send(res, 500, 0, "Unable to delete cart.", []);
  const remove = await cartService.removeCart(cartId);
  if (remove.status) response.send(res, 200, 1, remove.msg, []);
  else response.send(res, 500, 0, remove.msg, []);
};

module.exports = {
  addCartDetails,
  getCartDetails,
  updateCartDetails,
  getCartProductDetails,
  deleteCartItem,
  removeCart,
};
