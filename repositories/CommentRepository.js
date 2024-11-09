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
                  _id: 1,
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
              _id: "$user._id",
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

  async getAllCommentVideoId(videoId, query, requesterId) {
    try {
      // Create search query
      const searchQuery = {
        isDeleted: false,
        level: 0,
        videoId: new mongoose.Types.ObjectId(videoId),
      };
  
      // Determine sorting field and order
      let sortField = "dateCreated"; // Default sort field
      let sortOrder = query.order === "ascending" ? 1 : -1;
  
      if (query.sortBy === "like") sortField = "likesCount";
      else if (query.sortBy === "date") sortField = "dateCreated";
  
      // Base aggregation pipeline
      const basePipeline = [
        { $match: searchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 1,
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
              _id: "$user._id",
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
            responseTo: 1,
            level: 1,
            videoId: 1,
            likesCount: { $size: "$likeBy" },
            isLiked: { $in: [new mongoose.Types.ObjectId(requesterId), "$likeBy"] },
          },
        },
        {
          $sort: { [sortField]: sortOrder }, // Dynamic sorting stage
        },
      ];
  
      // Run the aggregation pipeline
      const comments = await Comment.aggregate(basePipeline);
  
      return comments;
    } catch (error) {
      throw new Error(error.message);
    }
  }  

  async toggleLikeCommentRepository(userId, commentId) {
    let hasLiked = false;
    try {
      const checkComment = await Comment.findById(commentId);
      if (!checkComment || checkComment.isDeleted) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Comment not found");
      }
  
      hasLiked = checkComment.likeBy.includes(userId);
      const action = hasLiked ? 'unlike' : 'like';
      const updateOperation = hasLiked
        ? { $pull: { likeBy: userId } } 
        : { $addToSet: { likeBy: userId } };
  
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        updateOperation,
        { new: true }
      );
  
      return { action, updatedComment };
    } catch (error) {
      throw new Error(`Failed to ${action ? "like" : "unlike"} comment`);
    }
  }  

  async getCommentThread(commentId, limit) {
    const numericLimit = parseInt(limit, 10); // Ensure limit is a number
  
    try {
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
                  _id: 1,
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
            maxDepth: 10, // You can make this dynamic
            depthField: "graphLevel",
          },
        },
        // Filter out deleted comments in the replies (children)
        {
          $addFields: {
            children: {
              $filter: {
                input: "$children",
                as: "child",
                cond: { $eq: ["$$child.isDeleted", false] },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "children.userId",
            foreignField: "_id",
            as: "childUsers",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  avatar: 1,
                  fullName: 1,
                  nickName: 1,
                },
              },
            ],
          },
        },
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
                              input: "$childUsers",
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
        {
          $addFields: {
            children: {
              $sortArray: { input: "$children", sortBy: { graphLevel: 1 } },
            },
          },
        },
        { $addFields: { children: { $slice: ["$children", numericLimit] } } },
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
            childUsers: 0,
          },
        },
      ]);
  
      return comment[0] || null;
    } catch (err) {
      throw new Error("Unable to fetch comment thread");
    }
  }  

  async softDeleteCommentRepository(id) {
    try {
      const deleteComment = await this.getCommentThread(id, 1000000);

      const childrenComments = deleteComment.children;

      childrenComments.forEach(async (comment) => {
        const childComment = await Comment.findByIdAndUpdate(comment._id, {
          isDeleted: true,
        });
      });

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Comment not found");
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
