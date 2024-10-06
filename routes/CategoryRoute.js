const express = require("express");
const CategoryController = require("../controllers/CategoryController");

const router = express.Router();
const categoryController = new CategoryController();

router.post("/categories", (req, res) =>
  categoryController.createCategory(req, res)
);

router.get("/categories/:id", (req, res) =>
  categoryController.getCategory(req, res)
);

router.get("/categories", (req, res) =>
  categoryController.getAllCategory(req, res)
);

router.put("/categories/:id", (req, res) =>
  categoryController.updateCategory(req, res)
);

router.patch("/categories/deactivate/:id", (req, res) =>
  categoryController.deactivateCategory(req, res)
);

router.delete("/categories/:id", (req, res) =>
  categoryController.deleteCategory(req, res)
);

module.exports = router;
