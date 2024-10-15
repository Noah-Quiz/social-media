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
route.get("/dashboard", userController.getStatsByDateController);

// route.use(AuthMiddleware);

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
 *       description: Update user wallet successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.post("/follow", userController.toggleFollowController);

route.post("/history", historyController.createHistoryRecordController);

route.get("/history", historyController.getAllHistoryRecordsController);

route.delete("/history", historyController.clearAllHistoryRecordsController);

route.delete(
  "/history/:historyId",
  historyController.deleteHistoryRecordController
);

route.put("/watch-time", userController.updateTotalWatchTimeController);

module.exports = route;
