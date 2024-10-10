const { default: mongoose } = require("mongoose");
const Comment = require("../entities/CommentEntity");

class CommentRepository {
  async createComment(commentData) {
    try {
      const comment = await Comment.create(commentData);
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateComment(id, commentData) {
    try {
      const comment = await Comment.findByIdAndUpdate(id, commentData, {
        new: true,
      });
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getComment(id) {
    try {
      const comment = await Comment.find({ _id: id, isDeleted: false });
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllCommentVideoId(videoId) {
    try {
      const comments = await Comment.find({ videoId: videoId });
      return comments;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async softDeleteComment(id) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true, lastUpdated: new Date() },
        },
        { new: true }
      );
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async like(userId, commentId) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $addToSet: { likeBy: userId } }, // $addToSet prevents duplicates
        { new: true }
      );
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async dislike(userId, commentId) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likeBy: userId } },
        { new: true }
      );
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getCommentThread(commentId, limit) {
    const numericLimit = parseInt(limit, 10); // Ensure limit is a number
    return Comment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(commentId) } }, // Match the specific comment with 'new'
      {
        $graphLookup: {
          from: "comments",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "responseTo",
          as: "children",
          maxDepth: 10, // Set max depth to control how deep replies go
          depthField: "level",
        },
      },
      // Filter out deleted comments
      {
        $addFields: {
          children: {
            $sortArray: { input: "$children", sortBy: { level: 1 } }, // Change to { level: -1 } for descending order
          },
        },
      },
      // Limit the total number of replies returned
      { $addFields: { children: { $slice: ["$children", numericLimit] } } }, // Use numericLimit here
    ]);
  }
}

module.exports = CommentRepository;
