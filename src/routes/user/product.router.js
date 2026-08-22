const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const router = express.Router();
const productController = require("../../controllers/user/product.controller");

router.get("/getCategoryList", productController.getCategoryList);
router.get("/getProductList/:pinCode", productController.getProductList);
router.get("/getProductReview", productController.getProductReview);
router.get("/getShippingCostOnPin/:pinCode", productController.getShippingCostOnPin);

module.exports = router;
