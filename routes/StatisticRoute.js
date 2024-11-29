const express = require("express");
const statisticRoutes = express.Router();
require("dotenv").config();

const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");

const StatisticController = require("../controllers/StatisticController");
const HistoryController = require("../controllers/HistoryController");
const UserController = require("../controllers/UserController");
const statisticController = new StatisticController();
const historyController = new HistoryController();
const userController = new UserController();
statisticRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/statistics/users/new:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all statistics of new users.
 *     description: Get all statistics of new users. This API is only for ADMIN.
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Get new users statistic successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
statisticRoutes.get(
  "/users/new",
  requireRole(UserEnum.ADMIN),
  statisticController.countNewUsersController
);

/**
 * @swagger
 * /api/statistics/revenue:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all revenue statistics.
 *     description: Get all revenue statistics. This API is only for ADMIN.
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Get revenue statistics successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
statisticRoutes.get(
  "/revenue",
  requireRole(UserEnum.ADMIN),
  statisticController.countRevenueController
);
/**
 * @swagger
 * /api/statistics/streams:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all stream statistics.
 *     description: Get all stream statistics. This API is only for ADMIN.
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Get stream statistics successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
statisticRoutes.get(
  "/streams",
  requireRole(UserEnum.ADMIN),
  statisticController.countTotalStreamsController
);

statisticRoutes.get(
  "/streams/view",
  requireRole(UserEnum.ADMIN),
  statisticController.calculateStreamViewsController
);

/**
 * @swagger
 * /api/statistics/videos:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all video statistics.
 *     description: Get all video statistics. This API is only for ADMIN.
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Get video statistics successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
statisticRoutes.get(
  "/videos",
  requireRole(UserEnum.ADMIN),
  statisticController.countTotalVideosController
);

/**
 * @swagger
 * /api/statistics/video-views/{ownerId}:
 *   get:
 *     security:
 *       - bearerAuth: []  # Bearer token authentication
 *     summary: Get video view statistics
 *     description: Retrieves video view statistics for a specific owner based on the specified time unit and optional interval value.
 *     tags:
 *       - Statistics
 *     parameters:
 *       - name: ownerId
 *         in: path
 *         description: ID of the video owner
 *         required: true
 *         schema:
 *           type: string
 *       - name: TimeUnit
 *         in: query
 *         description: The time unit for the statistics (DAY, WEEK, MONTH, YEAR)
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - DAY
 *             - WEEK
 *             - MONTH
 *             - YEAR
 *       - name: value
 *         in: query
 *         description: Optional interval value (e.g., month index or year). For example, `value=1` for January.
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved video view statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statistic:
 *                   type: object
 *                   description: The statistical data for the requested video views
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: The title of the statistics (e.g., "This week's view")
 *                     xAxis:
 *                       type: string
 *                       description: The x-axis label (e.g., "Days")
 *                     yAxis:
 *                       type: string
 *                       description: The y-axis label (e.g., "Views")
 *                     data:
 *                       type: array
 *                       description: Data points for the graph
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: The date of the data point
 *                           views:
 *                             type: integer
 *                             description: Number of views for the date
 *                     total:
 *                       type: integer
 *                       description: Total views in the current interval
 *                     description:
 *                       type: string
 *                       description: Summary of view statistics comparison
 *                 message:
 *                   type: string
 *                   description: Informational message
 *             examples:
 *               example-response:
 *                 value:
 *                   statistic:
 *                     title: "This week's view"
 *                     xAxis: "Days"
 *                     yAxis: "Views"
 *                     data:
 *                       - date: "2024-11-25"
 *                         views: 0
 *                       - date: "2024-11-26"
 *                         views: 5
 *                       - date: "2024-11-27"
 *                         views: 1
 *                       - date: "2024-11-28"
 *                         views: 0
 *                       - date: "2024-11-29"
 *                         views: 0
 *                       - date: "2024-11-30"
 *                         views: 0
 *                       - date: "2024-12-01"
 *                         views: 0
 *                     total: 6
 *                     description: "Increased 6 views compared to the previous week"
 *                   message: "This method is called"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query parameters
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You do not have permission to perform this action
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Owner not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An unexpected error occurred
 */

statisticRoutes.get(
  "/video-views/:ownerId",
  historyController.getViewStatisticController
);

statisticRoutes.get(
  "/user-followers/:ownerId",
  userController.getUserFollowerStatisticController
);
module.exports = statisticRoutes;
