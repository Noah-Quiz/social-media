const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { uploadFile } = require("../middlewares/storeFile");
const videoRoutes = express.Router();
const videoController = new VideoController();
/**
 * @swagger
 * /api/videos/:
 *  post:
 *    tags: [Videos]
 *    summary: Create a video
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateVideoDto'
 *    responses:
 *      201:
 *        description: Create video successfully
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */

videoRoutes.post("/", AuthMiddleware, videoController.createVideoController);

/**
 * @swagger
 * /api/videos/:
 *  get:
 *   summary: Get all videos
 *   tags: [Videos]
 *   responses:
 *    200:
 *      description: Get all videos successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
videoRoutes.get("/", AuthMiddleware, videoController.getVideosController);

/**
 * @swagger
 * /api/videos/user/{userId}:
 *  get:
 *    summary: Get videos by user id
 *    tags: [Videos]
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        schema:
 *          type: string
 *          description: User ID
 *    200:
 *      description: Get videos by user id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
videoRoutes.get(
  "/user/:userId",
  AuthMiddleware,
  videoController.getVideosByUserIdController
);

/**
 * @swagger
 * /api/videos/my-playlist/{playlistId}:
 *  get:
 *    summary: Get videos by playlist id
 *    tags: [Videos]
 *    parameters:
 *      - in: path
 *        name: playlistId
 *        required: true
 *        schema:
 *          type: string
 *          description: Playlist ID
 *    200:
 *      description: Get videos by playlist id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
videoRoutes.get(
  "/my-playlist/:playlistId",
  AuthMiddleware,
  videoController.getVideosByPlaylistIdController
);

videoRoutes.put(
  "/:videoId",
  AuthMiddleware,
  uploadFile.fields([
    { name: "video", maxCount: 1 },
    { name: "videoThumbnail", maxCount: 1 },
  ]),
  videoController.uploadVideoController
);

videoRoutes.post(
  "/:videoId/generate-token",
  videoController.generateVideoEmbedUrlTokenController
);

/**
 * @swagger
 * /api/videos/{videoId}:
 *  patch:
 *    summary: Update a video by id
 *    tags: [Videos]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdateVideoDto'
 *    200:
 *      description: Update a video by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
videoRoutes.patch(
  "/:videoId",
  AuthMiddleware,
  uploadFile.fields([{ name: "videoThumbnail" }]),
  videoController.updateAVideoByIdController
);

/**
 * @swagger
 * /api/videos/{videoId}:
 *  get:
 *   summary: Get video by id
 *   tags: [Videos]
 *   parameters:
 *      - in: path
 *        name: videoId
 *        required: true
 *        schema:
 *          type: string
 *          description: Video ID
 *   responses:
 *    200:
 *      description: Get video by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */

videoRoutes.get(
  "/:videoId",
  AuthMiddleware,
  videoController.getVideoController
);

/**
 * @swagger
 * /api/videos/{videoId}/like:
 *  post:
 *   summary: Toggle like a video
 *   tags: [Videos]
 *   parameters:
 *      - in: path
 *        name: videoId
 *        required: true
 *        schema:
 *          type: string
 *        description: Video ID
 *      - in: query
 *        name: action
 *        required: true
 *        schema:
 *          type: string
 *        description: Action
 *      - in: header
 *        name: userId
 *        required: true
 *        schema:
 *          type: string
 *        description: User ID
 *   responses:
 *    200:
 *      description: Toggle like video by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */

videoRoutes.post(
  "/:videoId/like",
  AuthMiddleware,
  videoController.toggleLikeVideoController
);

/**
 * @swagger
 * /api/videos/{videoId}/view:
 *  post:
 *   summary: Increase view of a video
 *   tags: [Videos]
 *   parameters:
 *      - in: path
 *        name: videoId
 *        required: true
 *        schema:
 *          type: string
 *        description: Video ID
 *   responses:
 *    200:
 *      description: Increase view of a video by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */

videoRoutes.post(
  "/:videoId/view",
  AuthMiddleware,
  videoController.viewIncrementController
);

/**
 * @swagger
 * /api/videos/{videoId}:
 *  delete:
 *   summary: Delete a video
 *   tags: [Videos]
 *   parameters:
 *      - in: path
 *        name: videoId
 *        required: true
 *        schema:
 *          type: string
 *        description: Video ID
 *   responses:
 *    200:
 *      description: Delete video by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */

videoRoutes.delete(
  "/:videoId",
  AuthMiddleware,
  videoController.deleteVideoController
);
module.exports = videoRoutes;
