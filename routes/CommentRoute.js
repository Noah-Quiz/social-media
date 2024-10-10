const express = require("express");
const CommentController = require("../controllers/CommentController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const router = express.Router();
const commentController = new CommentController();
router.use(AuthMiddleware);
router.post("/", commentController.createCommentController);

router.get("/children", commentController.getChildrenCommentsController);

router.get("/video/:videoId", commentController.getVideoCommentsController);

router.put("/like/:id", commentController.likeCommentController);

router.put("/unlike/:id", commentController.unlikeCommentController);

router.get("/:id", commentController.getCommentController);

router.put("/:id", commentController.updateCommentController);

router.delete("/:id", commentController.deleteCommentController);

module.exports = router;
