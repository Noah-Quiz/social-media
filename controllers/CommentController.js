const CreateCommentDto = require("../dtos/Comment/CreateCommentDto");
const GetChildrenCommentsDto = require("../dtos/Comment/GetChildrenCommentsDto");
const GetVideoCommentsDto = require("../dtos/Comment/GetVideoCommentsDto");
const ToggleLikeCommentDto = require("../dtos/Comment/ToggleLikeCommentDto");
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
  toggleLikeCommentService,
} = require("../services/CommentService");

class CommentController {
  async createCommentController(req, res, next) {
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

      await createCommentDto.validate();

      const comment = await createCommentService(
        userId,
        videoId,
        content,
        responseTo
      );

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getCommentController(req, res, next) {
    const { commentId } = req.params;
    const { requesterId } = req.query;

    try {
      const comment = await getCommentService(commentId, requesterId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getVideoCommentsController(req, res, next) {
    try {
      const { videoId } = req.params;
      const { requesterId } = req.query;

      const query = {
        sortBy: req.query.sortBy,
        order: req.query.order
      }

      const getVideoCommentsDto = new GetVideoCommentsDto(videoId, query.sortBy, query.order);
      await getVideoCommentsDto.validate();

      const comments = await getVideoCommentsService(
        videoId,
        query,
        requesterId
      );

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
        .json({ message: "Delete successfully" });
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
        .json({ comment, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async toggleLikeCommentController(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
  
      const toggleLikeCommentDto = new ToggleLikeCommentDto(commentId, userId);
      await toggleLikeCommentDto.validate();
  
      const action = await toggleLikeCommentService(userId, commentId);
  
      return res.status(StatusCodeEnums.OK_200).json({ message: `${action?.charAt(0)?.toUpperCase() + action?.slice(1)} comment successfully` });
    } catch (error) {
      next(error);
    }
  }  
  
  async getChildrenCommentsController(req, res, next) {
    try {
      const { commentId } = req.params;
      const { limit, requesterId } = req.query;
  
      const getChildrenCommentsDto = new GetChildrenCommentsDto(commentId, limit, requesterId);
      await getChildrenCommentsDto.validate();
  
      const { comments, maxLevel } = await getChildrenCommentsService(
        commentId,
        limit || 10,
        requesterId
      );
  
      if (Array.isArray(comments)) {
        // Calculate the total number of comments and their children
        const size = comments.reduce((total, comment) => {
          return total + 1 + (comment.children ? comment.children.length : 0);
        }, 0);
  
        return res.status(StatusCodeEnums.OK_200).json({
          comments,
          size,
          maxLevel,
          message: "Success",
        });
      } else {
        // If comments is a single comment, handle it accordingly
        const size = 1 + (comments.children ? comments.children.length : 0);
  
        return res.status(StatusCodeEnums.OK_200).json({
          comments,
          size,
          maxLevel,
          message: "Success",
        });
      }
    } catch (error) {
      next(error);
    }
  }  
  
}
module.exports = CommentController;
