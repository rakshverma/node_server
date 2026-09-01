const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const router = express.Router();
const orderController = require("../../controllers/user/order.controller");

router.post("/", orderController.addOrderDetails);
router.get("/list", verifyToken, orderController.getOrderList);
router.post("/cancel", verifyToken, orderController.cancelFutureOrder);
router.post("/review", verifyToken, orderController.addReview);
router.get("/review", verifyToken, orderController.getReviews);
router.delete("/review", verifyToken, orderController.deleteReview);
router.get("/item", orderController.getOrderItemOnId);

module.exports = router;
