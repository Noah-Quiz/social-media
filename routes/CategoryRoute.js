const express = require("express");
const CategoryController = require("../controllers/CategoryController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const { uploadImage } = require("../utils/stores/storeImage");

const router = express.Router();
const categoryController = new CategoryController();

router.use(AuthMiddleware);

router.post("/", requireRole(UserEnum.ADMIN), categoryController.createCategoryController);

router.get("/", categoryController.getAllCategoryController);

router.get("/:categoryId", categoryController.getCategoryController);

router.put("/:categoryId", requireRole(UserEnum.ADMIN), uploadImage.single("categoryImg"), categoryController.updateCategoryController);

router.delete("/:categoryId", requireRole(UserEnum.ADMIN), categoryController.deleteCategoryController);

module.exports = router;
