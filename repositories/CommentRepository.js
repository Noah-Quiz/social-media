const { default: mongoose } = require("mongoose");
const Comment = require("../entities/CommentEntity");
const { pipeline } = require("nodemailer/lib/xoauth2");

class CommentRepository {
  async createComment(commentData) {
    try {
      let level = 0; // Default for top-level comments

      if (commentData.responseTo) {
        const parentComment = await Comment.findById(commentData.responseTo);
        if (parentComment) {
          level = parentComment.level + 1; // Set level based on parent comment
        }
      }

      const comment = await Comment.create({ ...commentData, level });
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateComment(id, content) {
    try {
      const comment = await Comment.findOne({ _id: id });
      if (comment.content !== content) {
        comment.content = content;
      }
      await comment.save();
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getComment(id) {
    try {
      const comment = await Comment.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id), isDeleted: false },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true, // Optional: Preserve comment without user data
          },
        },
        {
          $project: {
            _id: 1,
            content: 1,
            dateCreated: 1,
            userId: 1, // Retain the original userId field
            user: {
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
            level: 1,
            videoId: 1,
            likeBy: 1,
          },
        },
      ]);

      // Return the first comment in case of multiple matches (there should ideally only be one)
      return comment.length > 0 ? comment[0] : null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllCommentVideoId(videoId, sortBy) {
    try {
      // Validate the videoId as a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new Error("Invalid video ID");
      }

      let comments;

      const basePipeline = [
        {
          $match: {
            videoId: new mongoose.Types.ObjectId(videoId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true, // Preserve comments without user data
          },
        },
        {
          $project: {
            userId: 1,
            content: 1,
            dateCreated: 1,
            user: {
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
            responseTo: 1,
            level: 1,
            videoId: 1,
            likeBy: 1,
          },
        },
      ];

      if (sortBy && sortBy === "like") {
        comments = await Comment.aggregate([
          ...basePipeline,
          {
            $addFields: {
              length: { $size: "$likeBy" }, // Calculate the number of likes
            },
          },
          {
            $sort: {
              length: -1, // Sort by number of likes (descending)
              dateCreated: -1, // Sort by creation date (most recent first)
            },
          },
          {
            $project: {
              length: 0, // Exclude the computed length field from the final result
            },
          },
        ]);
      } else {
        comments = await Comment.aggregate([
          ...basePipeline,
          {
            $sort: {
              dateCreated: -1, // Sort by creation date (most recent first)
            },
          },
        ]);
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

    const comment = await Comment.aggregate([
      // Match the parent comment and ensure it is not deleted
      {
        $match: {
          _id: new mongoose.Types.ObjectId(commentId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 0, // Remove _id from parent comment's user details
                fullName: 1,
                nickName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
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
          depthField: "graphLevel", // Depth for hierarchical sorting
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

      // Lookup user details for each child comment inside the children array
      {
        $lookup: {
          from: "users",
          localField: "children.userId", // Reference the userId of each child comment
          foreignField: "_id",
          as: "childUsers",
          pipeline: [
            {
              $project: {
                avatar: 1,
                fullName: 1,
                nickName: 1,
              },
            },
          ],
        },
      },

      // Map user details into each child comment
      {
        $addFields: {
          children: {
            $map: {
              input: "$children",
              as: "child",
              in: {
                $mergeObjects: [
                  "$$child",
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$childUsers", // Filter the user details for the correct child
                            as: "userDetail",
                            cond: {
                              $eq: ["$$userDetail._id", "$$child.userId"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // Sort by graphLevel (depth)
      {
        $addFields: {
          children: {
            $sortArray: { input: "$children", sortBy: { graphLevel: 1 } }, // Sort replies in ascending order of depth
          },
        },
      },

      // Limit the total number of replies returned
      { $addFields: { children: { $slice: ["$children", numericLimit] } } }, // Use numericLimit here
      // Project to remove unnecessary fields like 'isDeleted', '__v', 'graphLevel'
      {
        $project: {
          "children.isDeleted": 0,
          "children.__v": 0,
          "children.graphLevel": 0,
          "children.lastUpdated": 0,
          isDeleted: 0,
          __v: 0,
          graphLevel: 0,
          lastUpdated: 0,
          childUsers: 0, // Remove childUsers from final output
        },
      },
    ]);

    return comment;
  }
  async softDeleteCommentRepository(id) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) {
        throw new Error("No comment found");
      }
      comment.isDeleted = true;
      await comment.save();
      return comment;
    } catch (error) {
      throw new Error(`Error deleting comment: ${error.message}`);
    }
  }
}

module.exports = CommentRepository;
