const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const deleveryboyController = require("../../controllers/admin/deleveryboy.controller");

router.get("/details/:id", verifyToken, deleveryboyController.getDeliveryBoyOnId);
router.get("/", verifyToken, deleveryboyController.getAllDeleveryBoyList);
router.put("/edit", verifyToken, deleveryboyController.editDeleveryBoy);
router.post("/add", verifyToken, deleveryboyController.addDeleveryBoy);
router.get("/deliveryList", verifyToken, deleveryboyController.deliveryList);
router.delete("/deleteDeliveryBoy", verifyToken, deleveryboyController.deleteDeliveryBoy);

module.exports = router;
