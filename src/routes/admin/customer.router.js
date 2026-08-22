const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const customerController = require("../../controllers/admin/customer.controller");

router.get("/", verifyToken, customerController.getAllCustomers);

module.exports = router;
