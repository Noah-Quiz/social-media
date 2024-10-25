const CreateCommentDto = require("../dtos/Comment/CreateCommentDto");
const GetChildrenCommentsDto = require("../dtos/Comment/GetChildrenCommentsDto");
const GetVideoCommentsDto = require("../dtos/Comment/GetVideoCommentsDto");
const LikeCommentDto = require("../dtos/Comment/LikeCommentDto");
const UnlikeCommentDto = require("../dtos/Comment/UnlikeCommentDto");
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
    try {
      const userId = req.userId;
      const videoId = req.body.videoId;
      const content = req.body.content;
      const responseTo = req.body.responseTo;
      const createCommentDto = new CreateCommentDto(
        userId,
        videoId,
        content,
        responseTo
      );
      console.log(userId, "+", videoId, "+", content, "+", responseTo);
      await createCommentDto.validate();

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
    const { commentId } = req.params;
    try {
      const comment = await getCommentService(commentId);
      if (!comment) {
        return res.status(500).json("Comment not found");
      }
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getVideoCommentsController(req, res) {
    try {
      const { sortBy } = req.query;
      const { videoId } = req.params;
      const getVideoCommentsDto = new GetVideoCommentsDto(videoId, sortBy);
      await getVideoCommentsDto.validate();

      const comments = await getVideoCommentsService(videoId, sortBy);
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
    const { commentId } = req.params;
    const userId = req.userId;

    try {
      const comment = await softDeleteCommentService(userId, commentId);
      return res
        .status(200)
        .json({ comments: comment, message: "Delete successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async updateCommentController(req, res) {
    const { commentId } = req.params;
    const userId = req.userId;
    const { content } = req.body;
    if (!content || content === "") {
      return res.status(400).json({ message: "Content is required" });
    }
    try {
      const comment = await updateCommentService(userId, commentId, content);
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async likeCommentController(req, res) {
    try {
      const { commentId } = req.params;
      // const { userId } = req.body;
      const userId = req.userId;
      const likeCommentDto = new LikeCommentDto(commentId, userId);
      await likeCommentDto.validate();

      const comment = await likeService(userId, commentId);
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async unlikeCommentController(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
      const unlikeCommentDto = new UnlikeCommentDto(commentId, userId);
      await unlikeCommentDto.validate();

      const comment = await unlikeService(userId, commentId);
      return res.status(200).json({ comments: comment, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getChildrenCommentsController(req, res) {
    try {
      const { commentId } = req.params;
      const { limit } = req.query;
      const getChildrenCommentsDto = new GetChildrenCommentsDto(
        commentId,
        limit
      );
      await getChildrenCommentsDto.validate();

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
