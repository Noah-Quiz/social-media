const express = require("express");
const VideoController = require("../controllers/VideoController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { uploadFile } = require("../middlewares/storeFile");
const HistoryController = require("../controllers/HistoryController");
const UserController = require("../controllers/UserController");
const videoRoutes = express.Router();
const videoController = new VideoController();
const historyController = new HistoryController();
const userController = new UserController();
videoRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/videos/user/watch-history:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all history records
 *     tags: [Videos]
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
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Specify the order of sorting (either ascending or descending)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search videos by title (case-insensitive)
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
videoRoutes.get(
  "/user/watch-history",
  historyController.getAllHistoryRecordsController
);

/**
 * @swagger
 * /api/videos/user/watch-history:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create history record
 *     tags: [Videos]
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
videoRoutes.post(
  "/user/watch-history",
  historyController.createHistoryRecordController
);

/**
 * @swagger
 * /api/videos/user/watch-history/{historyId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete history record by ID
 *     tags: [Videos]
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
videoRoutes.delete(
  "/user/watch-history/:historyId",
  historyController.deleteHistoryRecordController
);

/**
 * @swagger
 * /api/videos/user/watch-history:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete history records of a user
 *     tags: [Videos]
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

videoRoutes.delete(
  "/user/watch-history",
  historyController.clearAllHistoryRecordsController
);

/**
 * @swagger
 * /api/videos/user/watch-time:
 *   put:
 *     summary: Update total watch time
 *     description: Update the total watch time for the authenticated user.
 *     tags: [Videos]
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
videoRoutes.put(
  "/user/watch-time",
  userController.updateTotalWatchTimeController
);

/**
 * @swagger
 * /api/videos/user/like-history:
 *   get:
 *     summary: Get history of liked videos
 *     tags: [Videos]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: size
 *         in: query
 *         description: The number of videos per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: title
 *         in: query
 *         description: Used to search
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of liked videos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videos:
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
 *                       videoUrl:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       likesCount:
 *                         type: integer
 *                       commentsCount:
 *                         type: integer
 *                       isLiked:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
videoRoutes.get(
  "/user/like-history",
  videoController.getVideoLikeHistoryController
);

/**
 * @swagger
 * /api/videos/user/{userId}:
 *   get:
 *     summary: Get videos by User ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of videos to return per page (minimum is 1)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (minimum is 1)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [like, view, date]
 *           default: date
 *         description: Sort the videos by number of likes, views, or date created
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Specify the order of sorting (either ascending or descending)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search videos by title (case-insensitive)
 *       - in: query
 *         name: enumMode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [private, public, unlisted, draft, member]
 *         description: Type of video. Only videos of type public or member are shown. Only admin can access all videos of all types
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
videoRoutes.get("/user/:userId", videoController.getVideosByUserIdController);

/**
 * @swagger
 * /api/videos/:
 *   post:
 *     summary: Create a video by uploading a video file
 *     description: Socket connect http://API_BASE_URL/socket/upload?userId=     Event Listener upload_video_progress   Emit upload_video_progress
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
  uploadFile.fields([{ name: "video" }]),
  videoController.createVideoController
);

/**
 * @swagger
 * /api/videos/:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of videos to return per page (minimum is 1)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (minimum is 1)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [like, view, date]
 *           default: date
 *         description: Sort the videos by number of likes, views, or date created
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Specify the order of sorting (either ascending or descending)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search videos by title (case-insensitive)
 *       - in: query
 *         name: enumMode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [private, public, unlisted, draft, member]
 *         description: Type of video. Only videos of type public or member are shown. Only admin can access all videos of all types
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
videoRoutes.get("/", videoController.getVideosController);

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
videoRoutes.get("/:videoId", videoController.getVideoController);

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
 *                 default: public
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
  uploadFile.fields([{ name: "videoThumbnail" }]),
  videoController.updateAVideoByIdController
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
videoRoutes.delete("/:videoId", videoController.deleteVideoController);

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
videoRoutes.post("/:videoId/like", videoController.toggleLikeVideoController);

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
videoRoutes.post("/:videoId/view", videoController.viewIncrementController);

/**
 * @swagger
 * /api/videos/relevant:
 *   get:
 *     summary: Get relevant videos based on categories
 *     description: Fetch relevant videos, with optional filters for categories and pagination.
 *     tags: [Videos]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: size
 *         in: query
 *         description: The number of videos per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: categoryIds
 *         required: false
 *         schema:
 *           type: string
 *           example: 671a01672a386fca99c73c02,671a01672a386fca99c73c04
 *         description: Categories to identify relevant streams, if empty return all streams
 *     responses:
 *       200:
 *         description: A list of relevant videos with pagination information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videos:
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
 *                       videoUrl:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       likesCount:
 *                         type: integer
 *                       commentsCount:
 *                         type: integer
 *                       isLiked:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
videoRoutes.get("/relevant", videoController.getRelevantVideosController);

/**
 * @swagger
 * /api/videos/recommendation:
 *   get:
 *     summary: Get recommended videos
 *     description: Fetch recommended videos
 *     tags: [Videos]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: size
 *         in: query
 *         description: The number of videos per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of recommended videos with pagination information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videos:
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
 *                       videoUrl:
 *                         type: string
 *                       thumbnailUrl:
 *                         type: string
 *                       likesCount:
 *                         type: integer
 *                       commentsCount:
 *                         type: integer
 *                       isLiked:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
videoRoutes.get(
  "/recommendation",
  videoController.getRecommendedVideosController
);

/**
 * @swagger
 * /api/videos/my-playlist/{playlistId}:
 *   get:
 *     summary: Get videos by playlist ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *           description: Playlist ID
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of videos to return per page (minimum is 1)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (minimum is 1)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [like, view, date]
 *           default: date
 *         description: Sort the videos by number of likes, views, or date created
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Specify the order of sorting (either ascending or descending)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search videos by title (case-insensitive)
 *       - in: query
 *         name: enumMode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [private, public, unlisted, draft, member]
 *         description: Type of video. Only videos of type public or member are shown. Only admin can access all videos of all types
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
  videoController.getVideosByPlaylistIdController
);
module.exports = videoRoutes;
