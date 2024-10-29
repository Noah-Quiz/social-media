const express = require("express");
const statisticRoutes = express.Router();
require("dotenv").config();

const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");

const StatisticController = require("../controllers/StatisticController");
const statisticController = new StatisticController();

statisticRoutes.use(AuthMiddleware);
statisticRoutes.use(requireRole(UserEnum.ADMIN));

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
statisticRoutes.get("/users/new", statisticController.countNewUsersController);

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
statisticRoutes.get("/revenue", statisticController.countRevenueController);
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
  statisticController.countTotalStreamsController
);

statisticRoutes.get(
  "/streams/view",
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
statisticRoutes.get("/videos", statisticController.countTotalVideosController);

module.exports = statisticRoutes;
