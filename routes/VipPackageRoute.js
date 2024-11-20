const express = require("express");
const VipPackageController = require("../controllers/VipPackageController");

const router = express.Router();
const vipPackageController = new VipPackageController();

router.get("/", (req, res, next) =>
  vipPackageController.getAllVipPackage(req, res, next)
);
router.get("/:id", (req, res, next) =>
  vipPackageController.getAVipPackage(req, res, next)
);
router.post("/", (req, res, next) =>
  vipPackageController.createVipPackageController(req, res, next)
);
router.put("/:id", (req, res, next) =>
  vipPackageController.updateVipPackageController(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  vipPackageController.deleteVipPackageController(req, res, next)
);

module.exports = router;
