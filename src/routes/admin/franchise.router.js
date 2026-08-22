const express = require("express");
const router = express.Router();
const verifyToken = require("../../utils/verifyToken");
const franchiseController = require("../../controllers/admin/franchise.controller");

router.get("/", verifyToken, franchiseController.getAllFranchise);
router.get("/getDistrictList", verifyToken, franchiseController.getDistrictList);
router.get("/getPinCodeList", verifyToken, franchiseController.getPinCodeList);
router.post("/add", verifyToken, franchiseController.addFranchise);
router.put("/edit", verifyToken, franchiseController.editFranchise);
router.get("/getAllRequest", verifyToken, franchiseController.getAllRequest);
router.get("/getAllFranchiseOnRole", verifyToken, franchiseController.getAllFranchiseOnRole);
router.get("/getShippingCostListOnId/:franchiseId", verifyToken, franchiseController.getShippingCostListOnId);
router.post("/updateShippingCostListOnId", verifyToken, franchiseController.updateShippingCostListOnId);
router.get("/getFranchiseDetailsOnId", verifyToken, franchiseController.getFranchiseDetailsOnId);
router.delete("/deleteFranchise", verifyToken, franchiseController.deleteFranchise);

module.exports = router;
