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
 *   post:
 *     summary: Get streams relevant to specific categories
 *     tags: [Streams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of category IDs
 *             required:
 *               - categoryIds
 *     responses:
 *       200:
 *         description: Get streams relevant successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 streams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       streamOnlineUrl:
 *                         type: string
 *                       streamServerUrl:
 *                         type: string
 *                       meta:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       status:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       likedBy:
 *                         type: array
 *                         items:
 *                           type: string
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                       isDeleted:
 *                         type: boolean
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                       enumMode:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           nickName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             imageUrl:
 *                               type: string
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
streamRoutes.post(
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
 *       200:
 *         description: Get streams recommendation successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 streams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       streamOnlineUrl:
 *                         type: string
 *                       streamServerUrl:
 *                         type: string
 *                       meta:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       status:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       likedBy:
 *                         type: array
 *                         items:
 *                           type: string
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                       isDeleted:
 *                         type: boolean
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                       enumMode:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           nickName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             imageUrl:
 *                               type: string
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
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
 *     summary: Get all streams
 *     tags: [Streams]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter for search (search all by default)
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [live, offline]
 *         description: Filter for stream status (search all by default)
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Filter for sort order (default descending)
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [date, view, like]
 *           default: date
 *         description: Filter for sort criteria (default date)
 *       - in: query
 *         name: requesterId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID of requester. If requester is owner, show stream in more detail. If the stream is of type member, hides critical information.
 *     responses:
 *       200:
 *         description: Get streams successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 streams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       streamOnlineUrl:
 *                         type: string
 *                       streamServerUrl:
 *                         type: string
 *                       meta:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       status:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       likedBy:
 *                         type: array
 *                         items:
 *                           type: string
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                       isDeleted:
 *                         type: boolean
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                       enumMode:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           nickName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             imageUrl:
 *                               type: string
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Bad request due to invalid parameters
 *       500:
 *         description: Internal server error
 */
streamRoutes.get("/", streamController.getStreamsController);

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
 *        required: true
 *        schema:
 *         type: string
 *      - in: query
 *        name: requesterId
 *        required: false
 *        schema:
 *         type: string
 *        description: User ID of requester. If requester is the owner, show detailed stream info. If the stream is of type member, hides critical information.
 *     responses:
 *      200:
 *       description: Get stream successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stream:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   streamOnlineUrl:
 *                     type: string
 *                   streamServerUrl:
 *                     type: string
 *                   meta:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   status:
 *                     type: string
 *                   thumbnailUrl:
 *                     type: string
 *                   likedBy:
 *                     type: array
 *                     items:
 *                       type: string
 *                   lastUpdated:
 *                     type: string
 *                     format: date-time
 *                   isDeleted:
 *                     type: boolean
 *                   dateCreated:
 *                     type: string
 *                     format: date-time
 *                   enumMode:
 *                     type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                       nickName:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                   categories:
 *                     type: array
 *                     items:
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
 *       description: Bad request due to invalid streamId or requesterId
 *      500:
 *       description: Internal server error
 */
streamRoutes.get(
  "/:streamId",
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
 * /api/streams/{streamId}/like:
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
 *         description: The ID of the stream to like or unlike
 *     responses:
 *       200:
 *         description: Like/Unlike stream successfully
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
  "/:streamId/like",
  AuthMiddleware,
  streamController.toggleLikeStreamController
);

module.exports = streamRoutes;
