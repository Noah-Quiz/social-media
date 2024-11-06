const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { uploadFile } = require("../middlewares/storeFile");
const videoRoutes = express.Router();
const videoController = new VideoController();

videoRoutes.get(
  "/like-history",
  AuthMiddleware,
  videoController.getVideoLikeHistoryController
);

/**
 * @swagger
 * /api/videos/:
 *   post:
 *     summary: Create a video by uploading a video file
 *     tags: [Videos]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *     responses:
 *       200:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 video:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                       example: "string"
 *                     description:
 *                       type: string
 *                       example: "string"
 *                     videoUrl:
 *                       type: string
 *                       example: "string"
 *                     videoEmbedUrl:
 *                       type: string
 *                       example: "string"
 *                     thumbnailUrl:
 *                       type: string
 *                       example: "string"
 *                     numOfViews:
 *                       type: integer
 *                       example: 0
 *                     likedBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                     enumMode:
 *                       type: string
 *                       example: "public"
 *                     userId:
 *                       type: string
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
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
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

videoRoutes.post(
  "/",
  AuthMiddleware,
  uploadFile.fields([{ name: "video" }]),
  videoController.createVideoController
);

/**
 * @swagger
 * /api/videos/:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Get all videos successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Success
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: string
 *                       title:
 *                         type: string
 *                         example: string
 *                       description:
 *                         type: string
 *                         example: string
 *                       videoUrl:
 *                         type: string
 *                         example: string
 *                       videoEmbedUrl:
 *                         type: string
 *                         example: string
 *                       videoServerUrl:
 *                         type: string
 *                         example: string
 *                       numOfViews:
 *                         type: integer
 *                         example: 0
 *                       likedBy:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                       enumMode:
 *                         type: string
 *                         example: "public"
 *                       thumbnailUrl:
 *                         type: string
 *                         example: string
 *                       userId:
 *                         type: string
 *                         example: string
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-18T08:14:54.852Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: string
 *                           nickName:
 *                             type: string
 *                             example: string
 *                           avatar:
 *                             type: string
 *                             example: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                 total:
 *                   type: integer
 *                   example: 8
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

videoRoutes.get("/", AuthMiddleware, videoController.getVideosController);

/**
 * @swagger
 * /api/videos/user/{userId}:
 *   get:
 *     summary: Get videos by user ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Get videos by user ID successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "string"
 *                       title:
 *                         type: string
 *                         example: "string"
 *                       description:
 *                         type: string
 *                         example: "string"
 *                       videoUrl:
 *                         type: string
 *                         example: "string"
 *                       videoEmbedUrl:
 *                         type: string
 *                         example: "string"
 *                       videoServerUrl:
 *                         type: string
 *                         example: "string"
 *                       numOfViews:
 *                         type: integer
 *                         example: 0
 *                       likedBy:
 *                         type: array
 *                         example: []
 *                       enumMode:
 *                         type: string
 *                         example: "public"
 *                       thumbnailUrl:
 *                         type: string
 *                         example: "string"
 *                       userId:
 *                         type: string
 *                         example: "string"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-18T08:14:54.852Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: "string"
 *                           nickName:
 *                             type: string
 *                             example: "string"
 *                           avatar:
 *                             type: string
 *                             example: "string"
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
videoRoutes.get(
  "/user/:userId",
  AuthMiddleware,
  videoController.getVideosByUserIdController
);

/**
 * @swagger
 * /api/videos/my-playlist/{playlistId}:
 *   get:
 *     summary: Get videos by playlist id
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *           description: Playlist ID
 *     responses:
 *       200:
 *         description: Get videos by playlist id successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get videos by playlistId successfully"
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "string"
 *                       title:
 *                         type: string
 *                         example: "string"
 *                       description:
 *                         type: string
 *                         example: "string"
 *                       videoUrl:
 *                         type: string
 *                         example: "string"
 *                       embedUrl:
 *                         type: string
 *                         example: "string"
 *                       numOfViews:
 *                         type: integer
 *                         example: 0
 *                       likedBy:
 *                         type: array
 *                         items:
 *                           type: string
 *                       enumMode:
 *                         type: string
 *                         example: "public"
 *                       thumbnailUrl:
 *                         type: string
 *                         example: "string"
 *                       userId:
 *                         type: string
 *                         example: "string"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-09T06:25:04.917Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                             example: "string"
 *                           nickName:
 *                             type: string
 *                             example: ""
 *                           avatar:
 *                             type: string
 *                             example: "string"
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

videoRoutes.get(
  "/my-playlist/:playlistId",
  AuthMiddleware,
  videoController.getVideosByPlaylistIdController
);

/**
 * @swagger
 * /api/videos/{videoId}:
 *   patch:
 *     summary: Update video details
 *     tags: [Videos]
 *     description: Updates the details of a specific video.
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the video to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Video title
 *               description:
 *                 type: string
 *                 description: Video description
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: List of category IDs (as a JSON array or comma-separated string)
 *                 example: ["671a01672a386fca99c73c02", "anotherCategoryId"]
 *               enumMode:
 *                 type: string
 *                 enum: [public, private, unlisted, member, draft]
 *                 description: Video accessibility
 *               videoThumbnail:
 *                 type: file
 *                 description: Thumbnail image file for the video
 *           encoding:
 *             categoryIds:
 *               style: form
 *               explode: true
 *     responses:
 *       200:
 *         description: Update video by id successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update video successfully"
 *                 video:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "string"
 *                     title:
 *                       type: string
 *                       example: "string"
 *                     description:
 *                       type: string
 *                       example: "string"
 *                     videoUrl:
 *                       type: string
 *                       example: "string"
 *                     videoEmbedUrl:
 *                       type: string
 *                       example: "string"
 *                     videoServerUrl:
 *                       type: string
 *                       example: "string"
 *                     numOfViews:
 *                       type: integer
 *                       example: 0
 *                     likedBy:
 *                       type: array
 *                       items:
 *                         type: string
 *                     enumMode:
 *                       type: string
 *                       example: "public"
 *                     thumbnailUrl:
 *                       type: string
 *                       example: "string"
 *                     categoryIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                     userId:
 *                       type: string
 *                       example: "string"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-31T04:06:49.351Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-31T04:06:49.351Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Bad request
 *       404:
 *         description: Video not found
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
 *        description: Video ID
 *   responses:
 *    200:
 *      description: Get video by id successfully
 *      content:
 *        application/json:
 *          example:
 *            message: "Success"
 *            video:
 *              _id: "string"
 *              title: "string"
 *              description: "string"
 *              videoUrl: "string"
 *              videoEmbedUrl: "string"
 *              videoServerUrl: "string"
 *              numOfViews: 0
 *              likedBy: []
 *              enumMode: "member"
 *              thumbnailUrl: "string"
 *              userId: "string"
 *              dateCreated: "2024-10-30T03:22:13.293Z"
 *              user:
 *                fullName: "string"
 *                nickName: "string"
 *                avatar: "string"
 *              categories:
 *                - _id: "string"
 *                  name: "string"
 *                - _id: "string"
 *                  name: "string"
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
 *        description: Action to perform ("like" or "unlike")
 *   security:
 *      - bearerAuth: []
 *   responses:
 *    200:
 *      description: Toggle like video by id successfully
 *      content:
 *        application/json:
 *          example:
 *            message: "Success"
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
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              video:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    example: "string"
 *                  title:
 *                    type: string
 *                    example: "string"
 *                  description:
 *                    type: string
 *                    example: "string"
 *                  videoUrl:
 *                    type: string
 *                    example: "string"
 *                  videoEmbedUrl:
 *                    type: string
 *                    example: "string"
 *                  videoServerUrl:
 *                    type: string
 *                    example: "string"
 *                  numOfViews:
 *                    type: integer
 *                    example: 1  # Incremented view count
 *                  likedBy:
 *                    type: array
 *                    items:
 *                      type: string
 *                    example: []  # Empty array of likes
 *                  enumMode:
 *                    type: string
 *                    example: "member"
 *                  thumbnailUrl:
 *                    type: string
 *                    example: "string"
 *                  categoryIds:
 *                    type: array
 *                    items:
 *                      type: string
 *                    example:
 *                      - "string"
 *                      - "string"
 *                  userId:
 *                    type: string
 *                    example: "string"
 *                  isDeleted:
 *                    type: boolean
 *                    example: false
 *                  dateCreated:
 *                    type: string
 *                    format: date-time
 *                    example: "2024-10-30T03:22:13.293Z"
 *                  lastUpdated:
 *                    type: string
 *                    format: date-time
 *                    example: "2024-10-30T03:22:13.293Z"
 *                  __v:
 *                    type: integer
 *                    example: 0
 *              message:
 *                type: string
 *                example: "Success"
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
 *      content:
 *        application/json:
 *          example:
 *            message: "Success"
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
