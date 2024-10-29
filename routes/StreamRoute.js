const express = require("express");
const StreamController = require("../controllers/StreamController");
const { uploadFile } = require("../middlewares/storeFile");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const checkUserSuspended = require("../middlewares/checkUserSuspended");

const streamController = new StreamController();
const streamRoutes = express.Router();

/**
 * @swagger
 * /api/streams/relevant:
 *   get:
 *     summary: Get streams relevant
 *     tags: [Streams]
 *     responses:
 *      200:
 *       description: Get streams relevant successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.get(
  "/relevant",
  AuthMiddleware,
  streamController.getRelevantStreamsController
);

/**
 * @swagger
 * /api/streams/recommendation:
 *   get:
 *     summary: Get streams recommendation
 *     tags: [Streams]
 *     responses:
 *      200:
 *       description: Get streams recommendation successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.get(
  "/recommendation",
  AuthMiddleware,
  streamController.getRecommendedStreamsController
);

/**
 * @swagger
 * /api/streams:
 *   get:
 *     summary: Get streams
 *     tags: [Streams]
 *     responses:
 *      200:
 *       description: Get streams successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.get("/", AuthMiddleware, streamController.getStreamsController);

/**
 * @swagger
 * /api/streams:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a stream
 *     tags: [Streams]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStreamDto'
 *     responses:
 *      200:
 *       description: Create stream successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.post(
  "/",
  AuthMiddleware,
  checkUserSuspended,
  streamController.createStreamController
);

/**
 * @swagger
 * /api/streams/{streamId}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a stream by Id
 *     tags: [Streams]
 *     parameters:
 *      - in: path
 *        name: streamId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Delete stream successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.delete(
  "/:streamId",
  AuthMiddleware,
  streamController.deleteStreamController
);

/**
 * @swagger
 * /api/streams/{streamId}:
 *   get:
 *     summary: Get a stream by Id
 *     tags: [Streams]
 *     parameters:
 *      - in: path
 *        name: streamId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Get stream successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.get(
  "/:streamId",
  AuthMiddleware,
  streamController.getStreamController
);

/**
 * @swagger
 * /api/streams/{streamId}:
 *   patch:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a stream by Id
 *     tags: [Streams]
 *     parameters:
 *      - in: path
 *        name: streamId
 *        schema:
 *         type: string
 *         required: true
 *      - in: formData
 *        name: streamThumbnail
 *        schema:
 *         type: file
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStreamDto'
 *     responses:
 *      200:
 *       description: Update stream successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.patch(
  "/:streamId",
  AuthMiddleware,
  uploadFile.single("streamThumbnail"),
  streamController.updateStreamController
);

streamRoutes.post(
  "/like/:streamId",
  AuthMiddleware,
  streamController.toggleLikeStreamController
);

module.exports = streamRoutes;
