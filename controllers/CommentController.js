const {
  createComment,
  getComment,
  getVideoComments,
  like,
  softDeleteComment,
  unlike,
  updateComment,
  getChildrenComments,
} = require("../services/CommentService");

class CommentController {
  async createComment(req, res) {
    const userId = req.userId;
    const videoId = req.body.videoId;
    const content = req.body.content;
    const responseTo = req.body.responseTo;
    if (!userId || !videoId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      const comment = await createComment(userId, videoId, content, responseTo);
      return res.status(201).json({ data: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getComment(req, res) {
    const { id } = req.params;
    try {
      const comment = await getComment(id);
      if (!comment) {
        res.status(500).json("Comment not found");
      }
      return res.status(200).json({ data: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getVideoComments(req, res) {
    const { videoId } = req.params;
    try {
      const comments = await getVideoComments(videoId);
      return res
        .status(200)
        .json({ data: comments, size: comments.length, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async deleteComment(req, res) {
    const { id } = req.params;
    try {
      const comment = await softDeleteComment(id);
      return res
        .status(200)
        .json({ data: comment, message: "Delete successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async updateComment(req, res) {
    const { id } = req.params;
    try {
      const comment = await updateComment(id, req.body);
      return res.status(200).json({ data: comment, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async likeComment(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const comment = await like(userId, id);
      return res.status(200).json({ data: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async unlikeComment(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    try {
      const comment = await unlike(userId, id);
      return res.status(200).json({ data: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getChildrenComments(req, res) {
    const limit = req.query.limit;
    const commentId = req.query.commentId;
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }
    try {
      const { comments, maxLevel } = await getChildrenComments(
        commentId,
        limit || 10
      );
      return res.status(200).json({
        data: comments,
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
