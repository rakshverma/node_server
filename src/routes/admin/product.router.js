const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const productController = require("../../controllers/admin/product.controller");
const upload = require("../../utils/fileUpload");

router.get("/", verifyToken, productController.getAllProducts);
router.post("/add", [verifyToken, upload.array("files")], productController.addProduct);
router.put("/edit/:productId", [verifyToken, upload.array("files")], productController.editProduct);
router.get("/priceeditinfo/:productId/:distributerId", verifyToken, productController.priceeditinfo);
router.get("/getProductPriceOnFranchise/:distributerId", verifyToken, productController.getProductPriceOnFranchise);
router.post("/updateProductPrice/:productId/:distributerId", verifyToken, productController.updateProductPrice);
router.get("/reviews", verifyToken, productController.getProductReviews);
router.delete("/review/:id", verifyToken, productController.deleteReview);
router.put("/status/:productId/:status", verifyToken, productController.updateProductStatus);
// router.put("/edit", verifyToken, productController.editCategory);
// router.delete("/", verifyToken, productController.deleteCategory);

module.exports = router;
