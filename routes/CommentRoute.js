const express = require("express");
const CommentController = require("../controllers/CommentController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const router = express.Router();
const commentController = new CommentController();
router.use(AuthMiddleware);
router.post("/", commentController.createComment);

router.get("/children", commentController.getChildrenComments);

router.get("/video/:videoId", commentController.getVideoComments);

router.put("/like/:id", commentController.likeComment);

router.put("/unlike/:id", commentController.unlikeComment);

router.get("/:id", commentController.getComment);

router.put("/:id", commentController.updateComment);

router.delete("/:id", commentController.deleteComment);

module.exports = router;
