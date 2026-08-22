const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("Bytes api working fine");
});

router.get("/health", function (req, res) {
  res.status(200).send({
    status: "ok",
    service: "jhatkabyte-api",
    timestamp: new Date().toISOString(),
  });
});

router.use("/test", require("./test.router"));
router.use("/admin/auth", require("./admin/auth.router"));
router.use("/admin/user", require("./admin/user.router"));
router.use("/admin/category", require("./admin/category.router"));
router.use("/admin/product", require("./admin/product.router"));
router.use("/admin/customer", require("./admin/customer.router"));
router.use("/admin/franchise", require("./admin/franchise.router"));
router.use("/admin/deleveryboy", require("./admin/deleveryboy.router"));
router.use("/admin/orders", require("./admin/order.router"));

// user routes
router.use("/auth", require("./user/auth.router"));
router.use("/user", require("./user/user.router"));
router.use("/product", require("./user/product.router"));
router.use("/cart", require("./user/cart.router"));
router.use("/order", require("./user/order.router"));

module.exports = router;
