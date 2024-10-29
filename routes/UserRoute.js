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

/**
 * @swagger
 * /api/users/point:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update user points
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of points to add/remove/exchange
 *                 example: 100
 *               type:
 *                 type: string
 *                 enum: [add, remove, exchange]
 *                 description: The type of point operation
 *                 example: "add"
 *     responses:
 *       200:
 *         description: Update points successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     point:
 *                       type: number
 *                       example: 13000
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                           example: 2958375
 *                         coin:
 *                           type: number
 *                           example: 150000
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.put("/point", userController.updatePointController);
/**
 * @swagger
 * /api/users/follower/{userId}:
 *   get:
 *     summary: Get followers of a user
 *     description: Retrieve a list of followers for a specific user by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to get followers for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved followers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 follower:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66e1185472404e6811cf15bc"
 *                       fullName:
 *                         type: string
 *                         example: "string"
 *                       avatar:
 *                         type: string
 *                         example: "string"
 *                       nickName:
 *                         type: string
 *                         example: "string"
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

route.get("/follower/:userId", userController.getFollowerController);

/**
 * @swagger
 * /api/users/following/{userId}:
 *   get:
 *     summary: Get users that a user is following
 *     description: Retrieve a list of users that a specific user is following by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to get following users for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved following users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66e1185472404e6811cf15ba"
 *                       fullName:
 *                         type: string
 *                         example: "string"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                       nickName:
 *                         type: string
 *                         example: "string"
 *                 message:
 *                   type: string
 *                   example: "success"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
route.get("/following/:userId", userController.getFollowingController);
/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get user dashboard statistics
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "string"
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 result:
 *                   type: object
 *                   properties:
 *                     totalFollows:
 *                       type: number
 *                       example: 0
 *                     totalFollowers:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
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
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 2969375
 *                     coin:
 *                       type: number
 *                       example: 0
 *                     formatedBalance:
 *                       type: string
 *                       example: "2,969,375"
 *                     formatedCoin:
 *                       type: string
 *                       example: "0"
 *                 message:
 *                   type: string
 *                   example: "Success"
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
 *         description: update user wallet successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 2968375
 *                     coin:
 *                       type: number
 *                       example: 0
 *                     formatedBalance:
 *                       type: string
 *                       example: "2,968,375"
 *                     formatedCoin:
 *                       type: string
 *                       example: "0"
 *                 message:
 *                   type: string
 *                   example: "Success"
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
 *       - bearerAuth: []
 *     summary: Toggle follow user by ID
 *     description: Your user will follow or unfollow another user
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleFollowDto'
 *     responses:
 *       200:
 *         description: Toggle follow user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Follow success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

route.post("/follow", userController.toggleFollowController);

/**
 * @swagger
 * /api/users/history:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all history records
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *           description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: number
 *           default: 10
 *           description: Number of items per page
 *     responses:
 *       200:
 *         description: Get all history records successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historyRecords:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "string"
 *                       userId:
 *                         type: string
 *                         example: "string"
 *                       videoId:
 *                         type: string
 *                         example: "string"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-29T08:59:12.203Z"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-29T08:59:12.201Z"
 *                 total:
 *                   type: number
 *                   example: 1
 *                 page:
 *                   type: number
 *                   example: 1
 *                 totalPages:
 *                   type: number
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
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
 *         description: Create history record successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historyRecord:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "string"
 *                     userId:
 *                       type: string
 *                       example: "string"
 *                     videoId:
 *                       type: string
 *                       example: "string"
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-29T08:59:12.203Z"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-29T08:59:12.201Z"
 *                 message:
 *                   type: string
 *                   example: "Success"
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
 *       - bearerAuth: []
 *     summary: Delete history records of a user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Delete all history records successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

route.delete("/history", historyController.clearAllHistoryRecordsController);

/**
 * @swagger
 * /api/users/history/{historyId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete history record by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The history record's ID
 *     responses:
 *       200:
 *         description: Delete history record successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       404:
 *         description: History record not found
 *       500:
 *         description: Internal server error
 */

route.delete(
  "/history/:historyId",
  historyController.deleteHistoryRecordController
);
/**
 * @swagger
 * /api/users/watch-time:
 *   put:
 *     summary: Update total watch time
 *     description: Update the total watch time for the authenticated user.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "string"
 *               watchTime:
 *                 type: number
 *                 example: 120
 *     responses:
 *       200:
 *         description: Successfully updated watch time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update watch time successfully"
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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
 *         description: Update user profile successfully
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
 *         description: Update user email successfully
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
 *                   example: "Update user email successfully"
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
 *         description: Update user password successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *
 *                 message:
 *                   type: string
 *                   example: "Update user password successfully"
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
