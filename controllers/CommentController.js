const CreateCommentDto = require("../dtos/Comment/CreateCommentDto");
const GetChildrenCommentsDto = require("../dtos/Comment/GetChildrenCommentsDto");
const GetVideoCommentsDto = require("../dtos/Comment/GetVideoCommentsDto");
const LikeCommentDto = require("../dtos/Comment/LikeCommentDto");
const UnlikeCommentDto = require("../dtos/Comment/UnlikeCommentDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
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
  async createCommentController(req, res, next) {
    try {
      const userId = req.userId;
      const videoId = req.body.videoId;
      const content = req.body.content;
      const responseTo = req.body.responseTo;
      console.log(req.body);
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
      return res
        .status(StatusCodeEnums.Created_201)
        .json({ comments: comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getCommentController(req, res, next) {
    const { commentId } = req.params;
    try {
      const comment = await getCommentService(commentId);
      if (!comment) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Comment not found"
        );
      }
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ comments: comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getVideoCommentsController(req, res, next) {
    try {
      const { sortBy } = req.query;
      const { videoId } = req.params;
      const getVideoCommentsDto = new GetVideoCommentsDto(videoId, sortBy);
      await getVideoCommentsDto.validate();

      const comments = await getVideoCommentsService(videoId, sortBy);
      return res.status(StatusCodeEnums.OK_200).json({
        comments: comments,
        size: comments.length,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteCommentController(req, res, next) {
    const { commentId } = req.params;
    const userId = req.userId;

    try {
      const comment = await softDeleteCommentService(userId, commentId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ comments: comment, message: "Delete successfully" });
    } catch (error) {
      next(error);
    }
  }
  async updateCommentController(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
      const { content } = req.body;
      if (!content || content === "") {
        throw new CoreException(
          StatusCodeEnums.BadRequest_400,
          "Content is required"
        );
      }
      const comment = await updateCommentService(userId, commentId, content);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ comments: comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async likeCommentController(req, res, next) {
    try {
      const { commentId } = req.params;
      // const { userId } = req.body;
      const userId = req.userId;
      const likeCommentDto = new LikeCommentDto(commentId, userId);
      await likeCommentDto.validate();

      const comment = await likeService(userId, commentId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ comments: comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async unlikeCommentController(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
      const unlikeCommentDto = new UnlikeCommentDto(commentId, userId);
      await unlikeCommentDto.validate();

      const comment = await unlikeService(userId, commentId);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ comments: comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async getChildrenCommentsController(req, res, next) {
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
      return res.status(StatusCodeEnums.OK_200).json({
        comment: comments,
        size: comments.length + comments.children.length,
        maxLevel: maxLevel,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = CommentController;
