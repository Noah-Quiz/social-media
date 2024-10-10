const {
  createCommentService,
  getCommentService,
  getVideoCommentsService,
  updateCommentService,
  softDeleteCommentService,
  likeService,
  unlikeService,
  getChildrenCommentsService,
} = require("../services/CommentService");

class CommentController {
  async createCommentController(req, res) {
    const userId = req.userId;
    const videoId = req.body.videoId;
    const content = req.body.content;
    const responseTo = req.body.responseTo;
    if (!userId || !videoId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      const comment = await createCommentService(
        userId,
        videoId,
        content,
        responseTo
      );
      return res.status(201).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getCommentController(req, res) {
    const { id } = req.params;
    try {
      const comment = await getCommentService(id);
      if (!comment) {
        res.status(500).json("Comment not found");
      }
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getVideoCommentsController(req, res) {
    const { videoId } = req.params;
    try {
      const comments = await getVideoCommentsService(videoId);
      return res.status(200).json({
        comments: comments,
        size: comments.length,
        message: "Success",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async deleteCommentController(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const comment = await softDeleteCommentService(userId, id);
      return res
        .status(200)
        .json({ comments: comment, message: "Delete successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async updateCommentController(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const comment = await updateCommentService(userId, id, req.body);
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async likeCommentController(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const comment = await likeService(userId, id);
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async unlikeCommentController(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const comment = await unlikeService(userId, id);
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getChildrenCommentsController(req, res) {
    const limit = req.query.limit;
    const commentId = req.query.commentId;
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }
    try {
      const { comments, maxLevel } = await getChildrenCommentsService(
        commentId,
        limit || 10
      );
      return res.status(200).json({
        comments: comments,
        size: comments.length + comments[0].children.length,
        maxLevel: maxLevel,
        message: "Success",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = CommentController;
