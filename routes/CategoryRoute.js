const express = require("express");
const CategoryController = require("../controllers/CategoryController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const { uploadImage } = require("../utils/stores/storeImage");

const router = express.Router();
const categoryController = new CategoryController();

router.use(AuthMiddleware);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Get all categories successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/", categoryController.getAllCategoryController);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a category
 *     description: Create a category with name and image url
 *     tags: [Categories]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *     responses:
 *       201:
 *         description: Create category successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  requireRole(UserEnum.ADMIN),
  uploadImage.single("categoryImg"),
  categoryController.createCategoryController
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *      - in: path
 *        name: categoryId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Get category successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/:categoryId", categoryController.getCategoryController);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update category by ID
 *     description: Update cetegory by ID, including fullName, nickName, avatar. This request just for ADMIN.
 *     tags: [Categories]
 *     consumes:
 *      - multipart/form-data
 *     parameters:
 *      - in: path
 *        name: categoryId
 *        schema:
 *         type: string
 *         required: true
 *      - in: formData
 *        name: categoryImg
 *        schema:
 *         type: file
 *         description: The category's image file
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryDto'
 *     responses:
 *      200:
 *       description: Update user profile successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
router.put(
  "/:categoryId",
  requireRole(UserEnum.ADMIN),
  uploadImage.single("categoryImg"),
  categoryController.updateCategoryController
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete category by ID
 *     description: Delete category by ID. This action is only allowed for ADMIN.
 *     tags: [Categories]
 *     parameters:
 *      - in: path
 *        name: categoryId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Delete user successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
router.delete(
  "/:categoryId",
  requireRole(UserEnum.ADMIN),
  categoryController.deleteCategoryController
);

module.exports = router;
