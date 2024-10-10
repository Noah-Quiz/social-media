const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createComment = async (userId, videoId, content, responseTo) => {
  const connection = new DatabaseTransaction();
  try {
    let newContent = content;
    if (responseTo) {
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
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getComment = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.getComment(id);
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getVideoComments = async (videoId) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.getAllCommentVideoId(
      videoId
    );
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const updateComment = async (id, commentData) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.updateComment(
      id,
      commentData
    );
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const softDeleteComment = async (id) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.softDeleteComment(id);
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const like = async (userId, commentId) => {
  const connection = new DatabaseTransaction();
  try {
    const comment = await connection.commentRepository.like(userId, commentId);
    return comment;
  } catch (error) {
    throw new Error(error.message);
  }
};
const unlike = async (userId, commentId) => {
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
const getChildrenComments = async (commentId, limit) => {
  const connection = new DatabaseTransaction();

  try {
    const comments = await connection.commentRepository.getCommentThread(
      commentId,
      limit
    );
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
  createComment,
  getComment,
  getVideoComments,
  updateComment,
  softDeleteComment,
  like,
  unlike,
  getChildrenComments,
};
