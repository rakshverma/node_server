const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const categoryController = require("../../controllers/admin/category.controller");

router.get("/", verifyToken, categoryController.getAllCategory);
router.post("/add", verifyToken, categoryController.addCategory);
router.put("/edit", verifyToken, categoryController.editCategory);
router.delete("/", verifyToken, categoryController.deleteCategory);

module.exports = router;
