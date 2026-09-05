const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const router = express.Router();
const userController = require("../../controllers/user/user.controller");

router.get("/getUserInfo", verifyToken, userController.getUserInfo);
router.get("/district/:pincode", userController.getUserDistrict);
router.get("/getDistrictList", userController.getDistrictList);
router.get("/addresses", verifyToken, userController.getUserAddressList);
router.post("/addUserAddress", verifyToken, userController.addUserAddress);
router.post("/addresses", verifyToken, userController.saveUserAddress);
router.put("/addresses/:id/default", verifyToken, userController.setDefaultUserAddress);
router.delete("/addresses/:id", verifyToken, userController.deleteUserAddress);
router.post("/updateUserAccount", verifyToken, userController.updateUserAccount);

module.exports = router;
