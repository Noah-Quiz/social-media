const express = require("express");
const CategoryController = require("../controllers/CategoryController");

const router = express.Router();
const categoryController = new CategoryController();

router.post("/", (req, res) => categoryController.createCategory(req, res));

router.get("/:id", (req, res) => categoryController.getCategory(req, res));

router.get("", (req, res) => categoryController.getAllCategory(req, res));

router.put("/:id", (req, res) => categoryController.updateCategory(req, res));

router.patch("/deactivate/:id", (req, res) =>
  categoryController.deactivateCategory(req, res)
);

router.delete("/:id", (req, res) =>
  categoryController.deleteCategory(req, res)
);

module.exports = router;
