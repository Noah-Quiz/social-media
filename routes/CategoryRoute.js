const express = require("express");
const CategoryController = require("../controllers/CategoryController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const router = express.Router();
const categoryController = new CategoryController();

router.use(AuthMiddleware);

router.post("/", (req, res) =>
  categoryController.createCategoryController(req, res)
);

router.get("/:id", (req, res) =>
  categoryController.getCategoryController(req, res)
);

router.get("/", (req, res) =>
  categoryController.getAllCategoryController(req, res)
);

router.put("/:id", (req, res) =>
  categoryController.updateCategoryController(req, res)
);

router.delete("/:id", (req, res) =>
  categoryController.deleteCategoryController(req, res)
);

module.exports = router;
