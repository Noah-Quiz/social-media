const express = require("express");
const CommentController = require("../controllers/CommentController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const router = express.Router();
const commentController = new CommentController();

router.use(AuthMiddleware);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Create a comment
 *     tags: [Comments]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentDto'
 *     responses:
 *      201:
 *         description: Comment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     content:
 *                       type: string
 *                       example: "Hello everybody"
 *                     userId:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     videoId:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     level:
 *                       type: number
 *                       example: 2
 *                     responseTo:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     likedBy:
 *                       type: array
 *                       items:
 *                          type: string
 *                       example: []
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *      400:
 *       description: Bad request
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: 'userId' is required."
 *      403:
 *       description: Creating comment on a draft video
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comments are disabled on draft video"
 *      404:
 *       description: Video not found
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while creating the comment."
 *
 */
router.post("/", commentController.createCommentController);

/**
 * @swagger
 * /api/comments/{commentId}/children:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all children comments of a comment
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: commentId
 *        schema:
 *         type: string
 *         required: true
 *      - in: query
 *        name: size
 *        schema:
 *          type: integer
 *          default: 10
 *        description: The number of comments to return per page (minimum is 1)
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        description: The page number to retrieve (minimum is 1)
 *     responses:
 *      200:
 *       description: Get children comments successfully
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67334ad12c0594e3bae7091b"
 *                     videoId:
 *                       type: string
 *                       example: "67334a7e2c0594e3bae7090e"
 *                     content:
 *                       type: string
 *                       example: "hello"
 *                     responseTo:
 *                       type: string
 *                       example: null
 *                     level:
 *                       type: integer
 *                       example: 0
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-11-12T12:32:17.220Z"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-11-12T12:32:17.220Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "66e14623eec8efa60b44d7bd"
 *                         fullName:
 *                           type: string
 *                           example: "Tam Tam"
 *                         avatar:
 *                           type: string
 *                           nullable: true
 *                         nickName:
 *                           type: string
 *                           example: ""
 *                     repliesCount:
 *                       type: integer
 *                       example: 2
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "673352820ead970f75a8ee90"
 *                           videoId:
 *                             type: string
 *                             example: "67334a7e2c0594e3bae7090e"
 *                           content:
 *                             type: string
 *                             example: "@Tam Tam hello"
 *                           responseTo:
 *                             type: string
 *                             example: "67334ad12c0594e3bae7091b"
 *                           level:
 *                             type: integer
 *                             example: 1
 *                           dateCreated:
 *                             type: string
 *                             example: "2024-11-12T13:05:06.071Z"
 *                           lastUpdated:
 *                             type: string
 *                             example: "2024-11-12T13:05:06.071Z"
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "671a14f46d05088423eeab91"
 *                               fullName:
 *                                 type: string
 *                                 example: "administrator"
 *                               avatar:
 *                                 type: string
 *                                 example: "https://social-media-z5a2.onrender.com/assets/images/users/671a14f46d05088423eeab91/62771_1731119584763.png"
 *                               nickName:
 *                                 type: string
 *                                 example: ""
 *                           repliesCount:
 *                             type: integer
 *                             example: 1
 *                           likesCount:
 *                             type: integer
 *                             example: 0
 *                           isLiked:
 *                             type: boolean
 *                             example: false
 *                 total:
 *                   type: integer
 *                   example: 2
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 likesCount:
 *                   type: integer
 *                   example: 1
 *                 isLiked:
 *                   type: boolean
 *                   example: false
 *      400:
 *       description: Bad request
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters."
 *      404:
 *       description: Comment not found
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving children comment."
 */
router.get(
  "/:commentId/children",
  commentController.getChildrenCommentsController
);

/**
 * @swagger
 * /api/comments/video/{videoId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get all comments of a video
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: videoId
 *        schema:
 *         type: string
 *         required: true
 *      - in: query
 *        name: sortBy
 *        schema:
 *          type: string
 *          enum: [like, date]
 *          default: date
 *        description: Sort the comments by number of likes, or date created
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *          enum: [ascending, descending]
 *          default: descending
 *        description: Specify the order of sorting (either ascending or descending)
 *      - in: query
 *        name: size
 *        schema:
 *          type: integer
 *          default: 10
 *        description: The number of comments to return per page (minimum is 1)
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        description: The page number to retrieve (minimum is 1)
 *     responses:
 *      200:
 *       description: Get comments of a video successfully
 *       content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     content:
 *                       type: string
 *                       example: "Hello everybody"
 *                     userId:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     videoId:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     level:
 *                       type: number
 *                       example: 2
 *                     responseTo:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     likedBy:
 *                       type: array
 *                       items:
 *                          type: string
 *                       example: []
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *      400:
 *       description: Bad request
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters."
 *      404:
 *       description: Video not found
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving children comment."
 *
 */
router.get("/video/:videoId", commentController.getVideoCommentsController);

/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     summary: Toggle like/unlike a comment
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: commentId
 *        schema:
 *         type: string
 *        required: true
 *        description: ID of the comment to like or unlike
 *     responses:
 *      200:
 *       description: Successfully toggled like status of the comment
 *       content:
 *         application/json:
 *           example: message "Like comment successfully" or "Unlike comment successfully" based on action
 *      400:
 *       description: Video not found / Comment not found
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *      404:
 *       description: Video not found / Comment not found
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found / Comment not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/:commentId/like", commentController.toggleLikeCommentController);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get a comment by id
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to fetch
 *     responses:
 *       200:
 *         description: Get comment successfully
 *         content:
 *           application/json:
 *             example:
 *               comment:
 *                 _id: "67334ad12c0594e3bae7091b"
 *                 videoId: "67334a7e2c0594e3bae7090e"
 *                 content: "hello"
 *                 level: 0
 *                 dateCreated: "2024-11-12T12:32:17.220Z"
 *                 lastUpdated: "2024-11-12T12:32:17.220Z"
 *                 user:
 *                   _id: "66e14623eec8efa60b44d7bd"
 *                   fullName: "Tam Tam"
 *                   nickName: ""
 *                   avatar: null
 *                 repliesCount: 3
 *                 likesCount: 1
 *                 isLiked: true
 *               message: "Success"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Video not found / Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found / Comment not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:commentId", commentController.getCommentController);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a comment by id
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the comment
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Update comment successfully
 *         content:
 *           application/json:
 *             example:
 *               comment:
 *                 _id: "67334ad12c0594e3bae7091b"
 *                 videoId: "67334a7e2c0594e3bae7090e"
 *                 userId: "66e14623eec8efa60b44d7bd"
 *                 content: "Updated comment content"
 *                 likedBy: ["66e14623eec8efa60b44d7bd"]
 *                 responseTo: null
 *                 level: 0
 *                 isDeleted: false
 *                 dateCreated: "2024-11-12T12:32:17.220Z"
 *                 lastUpdated: "2024-11-12T17:06:18.622Z"
 *                 __v: 0
 *               message: "Success"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Video not found / Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found / Comment not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/:commentId", commentController.updateCommentController);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a comment by id
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: commentId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Delete comment successfully
 *       content:
 *         application/json:
 *           example:
 *             comments:
 *               _id: "string"
 *               videoId: "string"
 *               userId: "string"
 *               content: "string"
 *               likedBy: []
 *               level: 0
 *               isDeleted: true
 *               dateCreated: "2024-11-04T03:02:02.965Z"
 *               lastUpdated: "2024-11-04T03:02:02.965Z"
 *               __v: 0
 *             message: "Delete successfully"
 *      400:
 *       description: Bad request
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *      404:
 *       description: Video not found / Comment not found
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video not found / Comment not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:commentId", commentController.deleteCommentController);

module.exports = router;
