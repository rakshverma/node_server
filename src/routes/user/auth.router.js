const express = require("express");
const router = express.Router();
const authController = require("../../controllers/user/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgotpassword", authController.forgotPassword);

module.exports = router;
