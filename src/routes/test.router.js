const express = require("express");
const router = express.Router();

router.get("/getTest", function (req, res) {
  res.json({ msg: "get test api worked" });
});

module.exports = router;
