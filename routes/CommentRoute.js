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
 *                     likeBy:
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
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["'userId' is required."]
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
 *        name: limit
 *        schema:
 *         type: string
 *     responses:
 *      200:
 *       description: Get children comments successfully
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
 *                     likeBy:
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
 *         type: string
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
 *                     likeBy:
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
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Like a video
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: commentId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Like video successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
router.put("/:commentId/like", commentController.likeCommentController);

/**
 * @swagger
 * /api/comments/{commentId}/unlike:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Unlike a video
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: commentId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Unlike video successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 */
router.put("/:commentId/unlike", commentController.unlikeCommentController);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a comment by id
 *     tags: [Comments]
 *     parameters:
 *      - in: path
 *        name: commentId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *       description: Get comment successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
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
 *               - commentId
 *               - content
 *     responses:
 *      200:
 *       description: Update comment successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
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
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 */
router.delete("/:commentId", commentController.deleteCommentController);

module.exports = router;
