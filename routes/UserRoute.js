const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const { uploadFile } = require("../middlewares/storeFile");
const HistoryController = require("../controllers/HistoryController");
const userController = new UserController();
const historyController = new HistoryController();

const route = express.Router();

route.use(AuthMiddleware);

route.put("/point", userController.updatePointController);

route.get("/follower/:userId", userController.getFollowerController);
route.get("/following/:userId", userController.getFollowingController);

route.get("/dashboard", userController.getStatsByDateController);

/**
 * @swagger
 * /api/users/{userId}/wallet:
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
 *       200:
 *         description: Get user wallet successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 150.75
 *                 coin:
 *                   type: number
 *                   example: 50
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/:userId/wallet", userController.getUserWalletController);

/**
 * @swagger
 * /api/users/{userId}/wallet:
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
route.put("/:userId/wallet", userController.updateUserWalletController);

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
 *         required: true
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
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        description: Page number
 *      - in: query
 *        name: size
 *        schema:
 *          type: integer
 *          default: 10
 *        description: Number of items per page
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: Search by name
 *     responses:
 *       200:
 *         description: Get all users successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66e1185472404e6811cf15bc"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       fullName:
 *                         type: string
 *                         example: "string"
 *                       avatar:
 *                         type: string
 *                         example: "string"
 *                       nickName:
 *                         type: string
 *                         example: "string"
 *                       phoneNumber:
 *                         type: string
 *                         example: "string"
 *                       follow:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             followId:
 *                               type: string
 *                               example: "66f6577eb4ffd9ae01870e52"
 *                             followDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-10-18T02:31:33.735Z"
 *                       followBy:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             followById:
 *                               type: string
 *                               example: "66f6577eb4ffd9ae01870e52"
 *                             followByDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-10-18T02:36:17.291Z"
 *                 message:
 *                   type: string
 *                   example: "Get all users successfully"
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 total:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
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
 *       200:
 *         description: Get user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     nickName:
 *                       type: string
 *                     role:
 *                       type: integer
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     email:
 *                       type: string
 *                       format: email
 *                     phoneNumber:
 *                       type: string
 *                       nullable: true
 *                     follow:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           followId:
 *                             type: string
 *                           followDate:
 *                             type: string
 *                             format: date-time
 *                     followBy:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties: {}
 *                 message:
 *                   type: string
 *                   example: "Get user successfully"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.get("/:userId", userController.getUserByIdController);

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update user profile by ID
 *     description: Update user profile by ID, including fullName, nickName, avatar.
 *     tags: [Users]
 *     consumes:
 *      - multipart/form-data
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *      - in: formData
 *        name: avatar
 *        schema:
 *         type: file
 *        description: The user's avatar image file
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileDto'
 *     responses:
 *      200:
 *         description: Get user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                 message:
 *                   type: string
 *                   example: "Update user profile successfully"
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
route.put(
  "/:userId/profile",
  uploadFile.single("avatar"),
  userController.updateUserProfileByIdController
);

/**
 * @swagger
 * /api/users/{userId}/email:
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
route.put("/:userId/email", userController.updateUserEmailByIdController);

/**
 * @swagger
 * /api/users/{userId}/password:
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
route.put("/:userId/password", userController.updateUserPasswordByIdController);

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
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                message:
 *                   type: string
 *                   example: "Success"
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
