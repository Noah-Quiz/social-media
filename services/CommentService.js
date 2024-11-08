const { default: mongoose } = require("mongoose");
const Comment = require("../entities/CommentEntity");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

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
        throw new Error("Comment not found");
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

    const data = {
      videoId,
      userId,
      content: newContent,
      likeBy: [],
      responseTo,
    };
    const comment = await connection.commentRepository.createComment(data);

    await sendNotificationsForComment(videoId, userId, responseTo);
    return comment;
  } catch (error) {
    throw new Error(error.message);
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
  if (!video) throw new Error("Video not found");

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

const getCommentService = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.getComment(id);
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getVideoCommentsService = async (videoId, sortBy) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.getAllCommentVideoId(
      videoId,
      sortBy
    );
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

//comment owner update duoc
const updateCommentService = async (userId, id, content) => {
  const connection = new DatabaseTransaction();
  try {
    const originalComment = await connection.commentRepository.getComment(id);
    if (!originalComment) {
      throw new Error("Comment not found");
    }
    let notCommentOwner =
      originalComment.userId.toString() !== userId.toString();
    if (notCommentOwner) {
      throw new Error("You can not update other people comment");
    }

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
      throw new Error("Comment not found");
    }

    const video = await connection.videoRepository.getVideoRepository(
      originalComment.videoId
    );
    if (!video) {
      throw new Error("Video not found for the comment");
    }

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new Error("User not found");
    }

    let notAdmin = user.role !== 1;

    let notVideoOwner = userId.toString() !== video.userId.toString();

    let notCommentOwner =
      originalComment.userId.toString() !== userId.toString();

    if (notCommentOwner && notVideoOwner && notAdmin) {
      throw new Error("Not authorized to delete this comment");
    }

    const comment =
      await connection.commentRepository.softDeleteCommentRepository(id);
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const likeService = async (userId, commentId) => {
  const connection = new DatabaseTransaction();

  try {
    const comment = await connection.commentRepository.like(userId, commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

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

    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const unlikeService = async (userId, commentId) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.dislike(
      userId,
      commentId
    );
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getChildrenCommentsService = async (commentId, limit) => {
  const connection = new DatabaseTransaction();

  try {
    const comments = await connection.commentRepository.getCommentThread(
      commentId,
      limit
    );
    if (!comments) {
      throw new Error("Comment not found");
    }
    const maxLevel =
      comments.length > 0
        ? Math.max(...comments[0].children.map((comment) => comment.level))
        : 0;
    return { comments, maxLevel };
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  createCommentService,
  getCommentService,
  getVideoCommentsService,
  updateCommentService,
  softDeleteCommentService,
  likeService,
  unlikeService,
  getChildrenCommentsService,
};
