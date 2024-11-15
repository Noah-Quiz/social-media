const { default: mongoose } = require("mongoose");
const Comment = require("../entities/CommentEntity");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { validLength, contentModeration } = require("../utils/validator");

const createCommentService = async (userId, videoId, content, responseTo) => {
  const connection = new DatabaseTransaction();

  try {
    let newContent = content;
    if (responseTo) {
      const checkComment = await Comment.findOne({
        _id: new mongoose.Types.ObjectId(responseTo),
        isDeleted: false,
      });

      if (!checkComment) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Comment not found"
        );
      }

      const parentComment = await connection.commentRepository.getComment(
        responseTo
      ); // Fetch parent comment first
      if (parentComment && parentComment.userId) {
        const user = await connection.userRepository.getAnUserByIdRepository(
          parentComment.userId
        ); // Fetch the user
        if (user) {
          newContent = `@${user.fullName} ${content}`; // Add the @ mention
        }
      }
    }

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if (
      (video.enumMode === "private" || video.enumMode === "draft") &&
      user.role !== UserEnum.ADMIN &&
      video.user?._id?.toString() !== userId?.toString()
    ) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    // Prevent comments on draft video
    if (video.enumMode === "draft") {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "Comments are disabled on draft video"
      );
    }

    //validate comment
    validLength(1, 2000, newContent, "Content of comment");
    contentModeration(newContent, "comment");
    const data = {
      videoId,
      userId,
      content: newContent,
      likedBy: [],
      responseTo,
    };
    const comment = await connection.commentRepository.createComment(data);

    await sendNotificationsForComment(videoId, userId, responseTo);
    return comment;
  } catch (error) {
    throw error;
  }
};

const sendNotificationsForComment = async (
  videoId,
  commentUserId,
  responseTo
) => {
  const connection = new DatabaseTransaction();

  // Lấy thông tin video
  const video = await connection.videoRepository.getVideoByIdRepository(
    videoId
  );

  if (!video) {
    throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
  }

  const videoOwnerId = video.userId;

  const commentUser = await connection.userRepository.findUserById(
    commentUserId
  );

  const notificationForVideoOwner = {
    avatar: commentUser.avatar,
    content: `${commentUser.fullName} đã bình luận về video của bạn`,
    check: null,
    seen: false,
    createdAt: new Date(),
    videoId: videoId,
  };

  if (!responseTo) {
    await connection.userRepository.notifiCommentRepository(videoOwnerId, {
      ...notificationForVideoOwner,
      check: null,
    });
  } else {
    const parentComment = await connection.commentRepository.getComment(
      responseTo
    );
    if (parentComment) {
      const parentCommentOwnerId = parentComment.userId;

      const notificationForParentCommentOwner = {
        avatar: commentUser.avatar,
        content: `${commentUser.fullName} đã trả lời bình luận của bạn`,
        check: responseTo,
        seen: false,
        createdAt: new Date(),
        videoId: videoId,
      };

      await connection.userRepository.notifiCommentRepository(videoOwnerId, {
        ...notificationForVideoOwner,
        check: null,
      });
      await connection.userRepository.notifiCommentRepository(
        parentCommentOwnerId,
        notificationForParentCommentOwner
      );
    }
  }
};

const getCommentService = async (commentId, requesterId) => {
  const connection = new DatabaseTransaction();
  try {
    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Requester not found"
        );
      }
    }

    const comment = await connection.commentRepository.getComment(
      commentId,
      requesterId
    );
    if (!comment) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Comment not found"
      );
    }

    const video = await connection.videoRepository.getVideoByIdRepository(
      comment.videoId
    );
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if (
      (video.enumMode === "private" || video.enumMode === "draft") &&
      requesterId?.toString() !== video.userId?.toString()
    ) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if (comment) {
      comment.likesCount = (comment.likedBy || []).length;
      comment.isLiked = (comment.likedBy || []).some(
        (userId) => userId?.toString() === requesterId?.toString()
      );
      delete comment.likedBy;
      delete comment.userId;
    }

    return comment;
  } catch (error) {
    throw error;
  }
};

const getVideoCommentsService = async (videoId, query, requesterId) => {
  const connection = new DatabaseTransaction();
  try {
    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Requester not found"
        );
      }
    }

    const video = await connection.videoRepository.getVideoByIdRepository(
      videoId
    );
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if (
      (video.enumMode === "private" || video.enumMode === "draft") &&
      requesterId?.toString() !== video.userId?.toString()
    ) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    let { comments, total, page, totalPages } =
      await connection.commentRepository.getAllCommentVideoId(
        videoId,
        query,
        requesterId
      );

    comments = comments.map((comment) => {
      comment.isLiked = requesterId
        ? (comment.likedBy || []).some(
            (userId) => userId?.toString() === requesterId?.toString()
          )
        : false;
      delete comment.likedBy;
      delete comment.userId;

      return comment;
    });

    return { comments, total, page, totalPages };
  } catch (error) {
    throw error;
  }
};

//comment owner update duoc
const updateCommentService = async (userId, id, content) => {
  const connection = new DatabaseTransaction();
  try {
    const user = await connection.userRepository.findUserById(userId);
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");

    const originalComment = await connection.commentRepository.getComment(id);
    if (!originalComment) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Comment not found"
      );
    }

    if (
      originalComment.userId?.toString() !== userId?.toString() &&
      user.role !== UserEnum.ADMIN
    ) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    //validate comment
    validLength(1, 2000, content, "Content of comment");
    contentModeration(content, "update comment");
    const comment = await connection.commentRepository.updateComment(
      id,
      content
    );

    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

//video owner xoa dc, comment owner xoa duoc, admin cung xoa duoc
const softDeleteCommentService = async (userId, id) => {
  const connection = new DatabaseTransaction();
  try {
    const originalComment = await connection.commentRepository.getComment(id);
    if (!originalComment || originalComment.length === 0) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Comment not found"
      );
    }

    const video = await connection.videoRepository.getVideoRepository(
      originalComment.videoId
    );
    if (!video) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Video not found for the comment"
      );
    }

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    let notAdmin = user.role !== UserEnum.ADMIN;

    let notVideoOwner = userId?.toString() !== video.userId?.toString();

    let notCommentOwner =
      originalComment.userId?.toString() !== userId?.toString();

    if (notCommentOwner && notVideoOwner && notAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const comment =
      await connection.commentRepository.softDeleteCommentRepository(id);
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const toggleLikeCommentService = async (userId, commentId) => {
  const connection = new DatabaseTransaction();

  try {
    const checkComment = await connection.commentRepository.getComment(
      commentId
    );
    if (!checkComment) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Comment not found"
      );
    }

    const { action, updatedComment: comment } =
      await connection.commentRepository.toggleLikeCommentRepository(
        userId,
        commentId
      );
    if (!comment) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Comment not found"
      );
    }

    if (action === "like") {
      const commentOwnerId = comment.userId;
      const user = await connection.userRepository.findUserById(userId);

      const notification = {
        avatar: user.avatar,
        content: `${user.fullName} đã like bình luận của bạn`,
        seen: false,
        createdAt: new Date(),
      };

      await connection.userRepository.notifiLikeCommentRepository(
        commentOwnerId,
        notification
      );
    }

    return action;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getChildrenCommentsService = async (commentId, query, requesterId) => {
  const connection = new DatabaseTransaction();

  try {
    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Requester not found"
        );
      }
    }

    const comment = await connection.commentRepository.getCommentThread(
      commentId,
      query
    );
    if (!comment) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Comment not found"
      );
    }

    const video = await connection.videoRepository.getVideoByIdRepository(
      comment.videoId
    );
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if (
      video.enumMode === "private" &&
      requesterId?.toString() !== video.userId?.toString()
    ) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    // Function to transform each comment (including its children)
    const transformComment = (comment) => {
      comment.likesCount = (comment.likedBy || []).length; // Count the number of likes
      comment.isLiked = (comment.likedBy || []).some(
        (userId) => userId?.toString() === requesterId?.toString() // Check if the requester liked the comment
      );

      delete comment.likedBy;
      delete comment.userId;

      if (Array.isArray(comment.children) && comment.children.length > 0) {
        // Recursively transform children comments if they exist
        comment.children = comment.children.map(transformComment);
      }

      return comment;
    };

    // Apply transformation to the top-level comment
    const transformedComment = transformComment(comment);

    // Calculate the max level by looking through all the children recursively
    const getMaxLevel = (comment) => {
      let maxChildLevel = comment.level || 0; // Start with the current level
      if (Array.isArray(comment.children)) {
        comment.children.forEach((child) => {
          const childMaxLevel = getMaxLevel(child); // Recursively get the max level for children
          maxChildLevel = Math.max(maxChildLevel, childMaxLevel);
        });
      }
      return maxChildLevel;
    };

    const maxLevel = getMaxLevel(transformedComment); // Get the maximum level of the entire comment tree

    return { comments: transformedComment, maxLevel };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCommentService,
  getCommentService,
  getVideoCommentsService,
  updateCommentService,
  softDeleteCommentService,
  toggleLikeCommentService,
  getChildrenCommentsService,
};
