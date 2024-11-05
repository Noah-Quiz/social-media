const express = require("express");
const CategoryController = require("../controllers/CategoryController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const { uploadFile } = require("../middlewares/storeFile");

const router = express.Router();
const categoryController = new CategoryController();

router.use(AuthMiddleware);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all categories
 *     description: Retrieves a list of all categories.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Get all categories successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "607d1b2f9f1b2c0017f9d2e5"
 *                   name:
 *                     type: string
 *                     example: "Electronics"
 *                   imageUrl:
 *                     type: string
 *                     example: "https://example.com/image.png"
 *                   dateCreated:
 *                     type: string
 *                     example: "2024-10-25T02:29:35.346+00:00"
 *                   lastUpdated:
 *                     type: string
 *                     example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request. Possible validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving categories."
 */
router.get("/", categoryController.getAllCategoryController);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a category
 *     description: Creates a new category with a name and an optional image file.
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *                 example: "Electronics"
 *               categoryUrl:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file for the category
 *     responses:
 *       201:
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.png"
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request. Possible validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: 'name' is required."
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["'name' is required.", "'imageUrl' must be a valid URL."]
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while creating the category."
 */

router.post(
  "/",
  requireRole(UserEnum.ADMIN),
  uploadFile.single("categoryUrl"),
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.png"
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while retrive the category."
 */
router.get("/:categoryId", categoryController.getCategoryController);
/**
 * @swagger
 * /api/categories/{categoryId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update category by ID
 *     description: Update a category by ID, including name and image. This request is restricted to ADMIN users.
 *     tags: [Categories]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the category
 *               categoryImg:
 *                 type: string
 *                 format: binary
 *                 description: The category's image file
 *     responses:
 *       200:
 *         description: Successfully updated the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     name:
 *                       type: string
 *                       example: "Electronics"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.png"
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request due to invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: 'name' is required."
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["'name' is required.", "'imageUrl' must be a valid URL."]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while updating the category."
 */

router.put(
  "/:categoryId",
  requireRole(UserEnum.ADMIN),
  uploadFile.single("categoryImg"),
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
 *       description: Delete category successfully
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete successfully"
 *      400:
 *       description: Bad request
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CategoryId not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while delete the category."
 */
router.delete(
  "/:categoryId",
  requireRole(UserEnum.ADMIN),
  categoryController.deleteCategoryController
);

module.exports = router;
