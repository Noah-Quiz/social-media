const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const { uploadImage } = require("../utils/stores/storeImage");
const HistoryController = require("../controllers/HistoryController");
const userController = new UserController();
const historyController = new HistoryController();

const route = express.Router();

route.use(AuthMiddleware);

/**
 * @swagger
 * /api/users/wallet/{userId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get user wallet by ID
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Get user wallet successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/wallet/:userId", userController.getUserWalletController);

/**
 * @swagger
 * /api/users/wallet/{userId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update user wallet by ID
 *     description: Update user balance, coin, or exchange balance to coin
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserWalletDto'
 *     responses:
 *      200:
 *       description: Update user wallet successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.put("/wallet/:userId", userController.updateUserWalletController);

/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Toggle follow user by ID
 *     description: Your user will follow or unfollow another user
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleFollowDto'
 *     responses:
 *      200:
 *       description: Toggle follow user successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.post("/follow", userController.toggleFollowController);

/**
 * @swagger
 * /api/users/history:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all history records
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: page
 *        schema:
 *         type: number
 *         default: 1
 *         description: Page number
 *      - in: path
 *        name: size
 *        schema:
 *         type: string
 *         default: 10
 *         description: Number of items per page
 *     responses:
 *      200:
 *       description: Get all history records successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.get("/history", historyController.getAllHistoryRecordsController);

/**
 * @swagger
 * /api/users/history:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create history record
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHistoryRecordDto'
 *     responses:
 *      200:
 *       description: Create history record successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.post("/history", historyController.createHistoryRecordController);

/**
 * @swagger
 * /api/users/history:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete history records of a user
 *     tags: [Users]
 *     responses:
 *      200:
 *       description: Delete all history records successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.delete("/history", historyController.clearAllHistoryRecordsController);

/**
 * @swagger
 * /api/users/history/{historyId}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete history record by id
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: historyId
 *        schema:
 *         type: string
 *         description: The history record's id
 *     responses:
 *      200:
 *       description: Delete history record successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.delete(
  "/history/:historyId",
  historyController.deleteHistoryRecordController
);

route.put("/watch-time", userController.updateTotalWatchTimeController);

/**
 * @swagger
 * /api/users:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: page
 *        schema:
 *         type: number
 *         default: 1
 *         description: Page number
 *      - in: path
 *        name: size
 *        schema:
 *         type: number
 *         default: 10
 *         description: Number of items per page
 *      - in: path
 *        name: name
 *        schema:
 *         type: string
 *         description: Search by name
 *     responses:
 *       201:
 *         description: Get user wallet successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/", userController.getAllUsersController);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Get user wallet successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/:userId", userController.getUserByIdController);

/**
 * @swagger
 * /api/users/profile/{userId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update user profile by ID
 *     description: Update user profile by ID, including fullName, nickName, avatar.
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileDto'
 *     responses:
 *      200:
 *       description: Update user profile successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.put(
  "/profile/:userId",
  uploadImage.single("avatar"),
  userController.updateUserProfileByIdController
);

/**
 * @swagger
 * /api/users/email/{userId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update user email by ID
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserEmailDto'
 *     responses:
 *      200:
 *       description: Update user email successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.put("/email/:userId", userController.updateUserEmailByIdController);

/**
 * @swagger
 * /api/users/password/{userId}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update user password by ID
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPasswordDto'
 *     responses:
 *      200:
 *       description: Update user password successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 */
route.put("/password/:userId", userController.updateUserPasswordByIdController);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete user by ID
 *     description: Delete user by ID. This action is only allowed for ADMIN.
 *     tags: [Users]
 *     parameters:
 *      - in: path
 *        name: userId
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
route.delete(
  "/:userId",
  requireRole(UserEnum.ADMIN),
  userController.deleteUserByIdController
);
module.exports = route;
