const express = require("express");
const StreamController = require("../controllers/StreamController");
const { uploadFile } = require("../middlewares/storeFile");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const checkUserSuspended = require("../middlewares/checkUserSuspended");

const streamController = new StreamController();
const streamRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Stream:
 *       type: object
 *       properties:
 *         stream:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: Title of the stream
 *             description:
 *               type: string
 *               description: Brief description of the stream
 *             userId:
 *               type: string
 *               description: Unique identifier of the user who created the stream
 *             uid:
 *               type: string
 *               description: Unique identifier for the stream session
 *             rtmps:
 *               type: object
 *               description: RTMPS stream details for publishing
 *               properties:
 *                 url:
 *                   type: string
 *                   description: RTMPS server URL
 *                 streamKey:
 *                   type: string
 *                   description: Stream key for authenticating the RTMPS stream
 *             rtmpsPlayback:
 *               type: object
 *               description: RTMPS stream details for playback
 *               properties:
 *                 url:
 *                   type: string
 *                   description: RTMPS server URL for playback
 *                 streamKey:
 *                   type: string
 *                   description: Stream key for authenticating playback
 *             srt:
 *               type: object
 *               description: SRT stream details for publishing
 *               properties:
 *                 url:
 *                   type: string
 *                   description: SRT server URL
 *                 streamId:
 *                   type: string
 *                   description: Stream ID for the SRT stream
 *                 passphrase:
 *                   type: string
 *                   description: Passphrase for securing the SRT stream
 *             srtPlayback:
 *               type: object
 *               description: SRT stream details for playback
 *               properties:
 *                 url:
 *                   type: string
 *                   description: SRT server URL for playback
 *                 streamId:
 *                   type: string
 *                   description: Stream ID for the SRT playback stream
 *                 passphrase:
 *                   type: string
 *                   description: Passphrase for securing SRT playback
 *             webRTC:
 *               type: object
 *               description: WebRTC stream details for publishing
 *               properties:
 *                 url:
 *                   type: string
 *                   description: WebRTC URL for publishing the stream
 *             webRTCPlayback:
 *               type: object
 *               description: WebRTC stream details for playback
 *               properties:
 *                 url:
 *                   type: string
 *                   description: WebRTC URL for playback of the stream
 *             meta:
 *               type: object
 *               description: Metadata related to the stream
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Custom name or label for the stream
 *             status:
 *               type: string
 *               enum: ["live", "offline"]
 *               description: Current status of the stream, either 'live' or 'offline'
 *             categoryIds:
 *               type: array
 *               description: List of category IDs associated with the stream
 *               items:
 *                 type: string
 *                 description: Unique identifier for a stream category
 *             peakViewCount:
 *               type: integer
 *               description: Maximum number of viewers the stream has had concurrently
 *             currentViewCount:
 *               type: integer
 *               description: Current number of viewers watching the stream
 *             dateCreated:
 *               type: string
 *               format: date-time
 *               description: Timestamp of when the stream was created
 */

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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               streams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     streamOnlineUrl:
 *                       type: string
 *                     streamServerUrl:
 *                       type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     status:
 *                       type: string
 *                     thumbnailUrl:
 *                       type: string
 *                     likedBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     isDeleted:
 *                       type: boolean
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                     enumMode:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         nickName:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                     categories:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *               message:
 *                 type: string
 *                 example: "Success"
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
 *       - bearerAuth: []
 *     summary: Create a stream
 *     tags: [Streams]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStreamDto'
 *     responses:
 *       200:
 *         description: Create stream successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stream:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     uid:
 *                       type: string
 *                     rtmps:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         streamKey:
 *                           type: string
 *                     rtmpsPlayback:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         streamKey:
 *                           type: string
 *                     srt:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         streamId:
 *                           type: string
 *                         passphrase:
 *                           type: string
 *                     srtPlayback:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         streamId:
 *                           type: string
 *                         passphrase:
 *                           type: string
 *                     webRTC:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                     webRTCPlayback:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     status:
 *                       type: string
 *                       enum: ["live", "offline"]
 *                       description: |
 *                         Status of the stream.
 *                     categoryIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                     peakViewCount:
 *                       type: integer
 *                     currentViewCount:
 *                       type: integer
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
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
 *       - bearerAuth: []
 *     summary: Delete a stream by Id
 *     tags: [Streams]
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete stream successfully
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
streamRoutes.delete(
  "/:streamId",
  AuthMiddleware,
  streamController.deleteStreamController
);

/**
 * @swagger
 * /api/streams/{streamId}:
 *   get:
 *     summary: Get stream
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
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stream:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     streamOnlineUrl:
 *                       type: string
 *                     streamServerUrl:
 *                       type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     status:
 *                       type: string
 *                     thumbnailUrl:
 *                       type: string
 *                     likedBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     isDeleted:
 *                       type: boolean
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                     enumMode:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         nickName:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                     categories:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *                 message:
 *                   type: string
 *                   example: "Success"
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
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStreamDto'
 *     responses:
 *      200:
 *       description: Update stream successfully
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stream:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     streamOnlineUrl:
 *                       type: string
 *                     streamServerUrl:
 *                       type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     status:
 *                       type: string
 *                     thumbnailUrl:
 *                       type: string
 *                     likedBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     isDeleted:
 *                       type: boolean
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                     enumMode:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         nickName:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                     categories:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         imageUrl:
 *                           type: string
 *                 message:
 *                   type: string
 *                   example: "Success"
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

/**
 * @swagger
 * /api/streams/like/{streamId}:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Toggle like on a stream
 *     tags: [Streams]
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the stream to like or unlike
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [like, unlike]
 *           description: Action to perform on the stream (like or unlike)
 *     responses:
 *       200:
 *         description: Stream like status toggled successfully
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
streamRoutes.post(
  "/like/:streamId",
  AuthMiddleware,
  streamController.toggleLikeStreamController
);

module.exports = streamRoutes;
