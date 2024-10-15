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
 *      200:
 *       description: Create comment successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
router.post("/", commentController.createCommentController);

/**
 * @swagger
 * /api/comments/children:
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
 *      - in: path
 *        name: limit
 *        schema:
 *         type: string
 *     responses:
 *      200:
 *       description: Get children comments successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
router.get("/children", commentController.getChildrenCommentsController);

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
 *         required: true
 *     responses:
 *      200:
 *       description: Get comments of a video successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
router.get("/video/:videoId", commentController.getVideoCommentsController);

/**
 * @swagger
 * /api/comments/like/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Like a video
 *     tags: [Comments]
  *     parameters:
 *      - in: path
 *        name: id
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
router.put("/like/:id", commentController.likeCommentController);

/**
 * @swagger
 * /api/comments/unlike/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Unlike a video
 *     tags: [Comments]
  *     parameters:
 *      - in: path
 *        name: id
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
router.put("/unlike/:id", commentController.unlikeCommentController);

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     summary: Get a comment by id
 *     tags: [Comments]
  *     parameters:
 *      - in: path
 *        name: id
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
router.get("/:id", commentController.getCommentController);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     security:
 *      - bearerAuth: []
 *     summary: Update a comment by id
 *     tags: [Comments]
  *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         required: true 
 *     responses:
 *      200:
 *       description: Update comment successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 */
router.put("/:id", commentController.updateCommentController);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     summary: Delete a comment by id
 *     tags: [Comments]
  *     parameters:
 *      - in: path
 *        name: id
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
router.delete("/:id", commentController.deleteCommentController);

module.exports = router;
