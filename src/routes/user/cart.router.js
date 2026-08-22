const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const router = express.Router();
const cartController = require("../../controllers/user/cart.controller");

router.get("/details/:cartId", cartController.getCartProductDetails);
router.get("/:cartId/:userId", cartController.getCartDetails);
router.post("/", cartController.addCartDetails);
router.put("/", cartController.updateCartDetails);
router.delete("/:cartId", cartController.deleteCartItem);
router.delete("/removeCart/:cartId", cartController.removeCart);

module.exports = router;
