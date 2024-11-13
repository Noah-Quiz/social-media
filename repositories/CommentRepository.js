const { default: mongoose } = require("mongoose");
const Comment = require("../entities/CommentEntity");
const { pipeline } = require("nodemailer/lib/xoauth2");

class CommentRepository {
  async createComment(commentData) {
    try {
      let level = 0; // Default for top-level comments
      if (
        commentData.responseTo !== undefined &&
        commentData.responseTo !== null &&
        commentData.responseTo !== ""
      ) {
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
        comment.lastUpdated = Date.now();
      }
      await comment.save();
      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getComment(id, requesterId) {
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $graphLookup: {
            from: "comments", 
            startWith: "$_id",
            connectFromField: "_id", 
            connectToField: "responseTo",
            as: "allReplies", 
            depthField: "level", 
            restrictSearchWithMatch: { responseTo: { $ne: null } },
          },
        },
        {
          $addFields: {
            repliesCount: { $size: "$allReplies" },
          },
        },
        {
          $project: {
            _id: 1,
            content: 1,
            dateCreated: 1,
            lastUpdated: 1,
            userId: 1,
            user: {
              _id: "$user._id",
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
            level: 1,
            videoId: 1,
            likesCount: { $size: "$likedBy" },
            likedBy: 1,
            repliesCount: 1, // Total replies count (all descendants)
          },
        },
      ]);
  
      // Return the first comment in case of multiple matches (there should ideally only be one)
      return comment.length > 0 ? comment[0] : null;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  

  async getAllCommentVideoId(videoId, query) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;

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

      const totalComments = await Comment.countDocuments(searchQuery);

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
          $graphLookup: {
            from: "comments", 
            startWith: "$_id",
            connectFromField: "_id", 
            connectToField: "responseTo",
            as: "allReplies", 
            depthField: "level", 
            restrictSearchWithMatch: { responseTo: { $ne: null } },
          },
        },
        {
          $addFields: {
            repliesCount: { $size: "$allReplies" },
          },
        },
        {
          $project: {
            userId: 1,
            content: 1,
            dateCreated: 1,
            lastUpdated: 1,
            user: {
              _id: "$user._id",
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
            responseTo: 1,
            level: 1,
            videoId: 1,
            likesCount: { $size: "$likedBy" },
            likedBy: 1,
            repliesCount: 1,
          },
        },
        { $sort: { [sortField]: sortOrder }, },
        { $skip: skip },
        { $limit: Number(size) },
      ];

      // Run the aggregation pipeline
      const comments = await Comment.aggregate(basePipeline);

      return {
        comments,
        total: totalComments,
        page: Number(page),
        totalPages: Math.ceil(totalComments / Number(size)),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async toggleLikeCommentRepository(userId, commentId) {
    let hasLiked = false;
    try {
      const comment = await Comment.findById(commentId);

      hasLiked = comment.likedBy.includes(userId);
      const action = hasLiked ? "unlike" : "like";
      const updateOperation = hasLiked
        ? { $pull: { likedBy: userId } }
        : { $addToSet: { likedBy: userId } };

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        updateOperation,
        { new: true }
      );

      return { action, updatedComment };
    } catch (error) {
      throw new Error(`Failed to ${hasLiked ? "like" : "unlike"} comment`);
    }
  }

  async getCommentThread(commentId, query) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10; // Ensure size is a number
      const skip = (page - 1) * size;
  
      // Fetch the parent comment (no pagination needed here)
      const parentComment = await Comment.aggregate([
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
            as: "allReplies", 
            depthField: "level", 
            restrictSearchWithMatch: { responseTo: { $ne: null } },
          },
        },
        {
          $addFields: {
            repliesCount: { $size: "$allReplies" },
          },
        },
        {
          $project: {
            _id: 1,
            content: 1,
            videoId: 1,
            userId: 1,
            user: 1,
            level: 1,
            dateCreated: 1,
            lastUpdated: 1,
            responseTo: 1,
            likedBy: 1,
            repliesCount: 1,
          },
        },
      ]);
  
      if (!parentComment.length) {
        return null;
      }
  
      // Fetch the total count of replies (children comments) to calculate totalPages
      const totalChildren = await Comment.countDocuments({
        responseTo: new mongoose.Types.ObjectId(commentId),
        isDeleted: false,
      });
  
      // Fetch the immediate children with pagination (applied only here)
      const children = await Comment.aggregate([
        {
          $match: {
            responseTo: new mongoose.Types.ObjectId(commentId),
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
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "responseTo",
            as: "replies",
          },
        },
        {
          $addFields: {
            repliesCount: { $size: "$replies" },
          },
        },
        {
          $sort: { dateCreated: -1 }, // Sort by dateCreated, descending
        },
        {
          $skip: skip, // Pagination: Skip items based on page number
        },
        {
          $limit: size, // Pagination: Limit the number of items per page
        },
        {
          $project: {
            _id: 1,
            content: 1,
            videoId: 1,
            userId: 1,
            user: 1,
            level: 1,
            dateCreated: 1,
            lastUpdated: 1,
            responseTo: 1,
            likedBy: 1,
            repliesCount: 1,
          },
        },
      ]);
  
      // Attach the children to the parent comment
      parentComment[0].children = children;
  
      // Add pagination details
      parentComment[0].total = totalChildren;
      parentComment[0].page = Number(page);
      parentComment[0].totalPages = Math.ceil(totalChildren / Number(size));
  
      return parentComment[0];
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
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Comment not found"
        );
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
