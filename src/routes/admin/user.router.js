const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const userController = require("../../controllers/admin/user.controller");

router.get("/getUserInfo", verifyToken, userController.getUserInfo);
router.get("/getPinCodeOnUser", verifyToken, userController.getPinCodeOnUser);
router.put("/editProfile", verifyToken, userController.editProfile);
router.put("/changePassword", verifyToken, userController.changePassword);

module.exports = router;
