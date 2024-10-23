const express = require("express");
const StreamController = require("../controllers/StreamController");
const { uploadImage } = require("../utils/stores/storeImage");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const checkUserSuspended = require("../middlewares/checkUserSuspended");

const streamController = new StreamController();
const streamRoutes = express.Router();

streamRoutes.get("/live-input", streamController.listLiveInputsController);

// streamRoutes.post("/live-input", AuthMiddleware, streamController.createLiveInputController);

streamRoutes.put(
  "/live-input/:streamId",
  AuthMiddleware,
  uploadImage.single("streamThumbnail"),
  streamController.updateLiveInputController
);

// streamRoutes.delete(
//   "/live-input/:streamId",
//   AuthMiddleware,
//   streamController.deleteLiveInputController
// );

/**
 * @swagger
 * /api/streams:
 *   get:
 *     summary: Get streams
 *     tags: [Streams]
 *     responses:
 *      200:
 *       description: Create stream successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.get("/", streamController.getStreamsController);

/**
 * @swagger
 * /api/streams/{streamId}:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a stream
 *     tags: [Streams]
 *     parameters:
 *      - in: path
 *        name: streamId
 *        schema:
 *         type: string
 *         required: true
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
  uploadImage.single("streamThumbnail"),
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
streamRoutes.get("/:streamId", streamController.getStreamController);

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
  uploadImage.single("thumbnailImg"),
  streamController.updateStreamController
);

/**
 * @swagger
 * /api/streams/end/{streamId}:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: End a stream by Id
 *     tags: [Streams]
 *     parameters:
 *      - in: path
 *        name: streamId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: End stream successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
streamRoutes.post(
  "/end/:streamId",
  AuthMiddleware,
  streamController.endStreamController
);

module.exports = streamRoutes;
