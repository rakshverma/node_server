const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const orderController = require("../../controllers/admin/order.controller");

router.get("/", verifyToken, orderController.getAllOrders);
router.get("/byFrnchise", verifyToken, orderController.getAllOrdersByFranchise);
router.get("/:id", verifyToken, orderController.getOrderOnID);
router.put("/status", verifyToken, orderController.updateOrderDeliveryStatus);
router.put("/assigndeliveryboy", verifyToken, orderController.updateDeliveryBoyOnOrder);
router.get("/deliveryboyList/:orderId", verifyToken, orderController.getFranchiseListOnOrder);
router.get("/getDeleveryboyListOnFranchise", verifyToken, orderController.getDeleveryboyListOnFranchise);
router.put("/updateDeleveryboyWithStatus", verifyToken, orderController.updateDeleveryboyWithStatus);
router.put("/cancelOrder/:id", verifyToken, orderController.cancelOrder);
router.put("/cancelOrders", verifyToken, orderController.cancelOrderItems);
router.put("/cancelOrderOnItemId", verifyToken, orderController.cancelOrderOnItemId);
router.put("/completeOrderItems", verifyToken, orderController.completeOrderItems);
router.put("/processOrderItems", verifyToken, orderController.processOrderItems);
router.put("/updateAdminNotes", verifyToken, orderController.updateAdminNotes);
router.put("/updateDeliveryDate", verifyToken, orderController.updateDeliveryDate);

module.exports = router;
