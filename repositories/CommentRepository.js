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

  async getAllCommentVideoId(videoId, sortBy) {
    try {
      let comments;

      if (sortBy && sortBy === "like") {
        comments = await Comment.aggregate([
          {
            $match: {
              videoId: new mongoose.Types.ObjectId(videoId),
              isDeleted: false,
            },
          },
          {
            $addFields: {
              length: {
                $size: "$likeBy",
              },
            },
          },
          {
            $sort: {
              length: -1,
              dateCreated: -1,
            },
          },
          {
            $project: {
              length: 0,
            },
          },
        ]);
      } else {
        comments = await Comment.find({
          videoId: videoId,
          isDeleted: false,
        }).sort({
          dateCreated: -1,
        });
      }

      return comments;
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
      // Match the parent comment and ensure it is not deleted
      {
        $match: {
          _id: new mongoose.Types.ObjectId(commentId),
          isDeleted: false,
        },
      },

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

      // Filter out deleted comments in the replies (children)
      {
        $addFields: {
          children: {
            $filter: {
              input: "$children",
              as: "child",
              cond: { $eq: ["$$child.isDeleted", false] }, // Filter where isDeleted is false
            },
          },
        },
      },

      // Sort by level (optional)
      {
        $addFields: {
          children: {
            $sortArray: { input: "$children", sortBy: { level: 1 } }, // Sort replies in ascending order of depth
          },
        },
      },

      // Limit the total number of replies returned
      { $addFields: { children: { $slice: ["$children", numericLimit] } } }, // Use numericLimit here
    ]);
  }
}

module.exports = CommentRepository;
