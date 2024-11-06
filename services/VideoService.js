const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { uploadThumbnail, uploadFiles } = require("../middlewares/LoadFile");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const crypto = require("crypto");
const {
  deleteBunnyStorageFileService,
  uploadBunnyStorageFileService,
} = require("./BunnyStreamService");
const {
  extractFilenameFromPath,
  removeFileName,
} = require("../middlewares/storeFile");
const UserEnum = require("../enums/UserEnum");
const createVideoService = async (
  userId,
  { title, videoUrl, videoEmbedUrl, thumbnailUrl }
) => {
  try {
    const connection = new DatabaseTransaction();

    // const { videoUrl, embedUrl, thumbnailUrl } = await uploadFiles(
    //   videoFile,
    //   thumbnailFile
    // );

    const video = await connection.videoRepository.createVideoRepository({
      userId,
      title,
      videoUrl,
      videoEmbedUrl,
      thumbnailUrl,
      enumMode: "draft",
    });

    return video;
  } catch (error) {
    throw error;
  }
};

const updateAVideoByIdService = async (videoId, data, thumbnailFile) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }
    if (thumbnailFile) {
      data.thumbnailUrl = `${process.env.APP_BASE_URL}/${thumbnailFile.path}`;
    }

    const updatedVideo =
      await connection.videoRepository.updateAVideoByIdRepository(
        videoId,
        data
      );

    return updatedVideo;
  } catch (error) {
    throw error;
  }
};

const toggleLikeVideoService = async (videoId, userId, action) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoByIdRepository(
      videoId
    );

    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    const videoOwnerId = video.user?._id;

    // const allowedActions = ["like", "unlike"];
    // if (!allowedActions.includes(action)) {
    //   throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid action");
    // }

    const result = await connection.videoRepository.toggleLikeVideoRepository(
      videoId,
      userId
    );

    const user = await connection.userRepository.findUserById(userId);

    const notification = {
      avatar: user.avatar,
      content: `${user.fullName} đã like video của bạn`,
      check: videoId,
      seen: false,
      createdAt: new Date(),
    };

    await connection.userRepository.notifiLikeVideoRepository(
      videoOwnerId,
      notification
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const viewIncrementService = async (videoId) => {
  try {
    const connection = new DatabaseTransaction();

    const result = await connection.videoRepository.viewIncrementRepository(
      videoId
    );
    const video = await connection.videoRepository.getVideoByIdRepository(
      videoId
    );
    if (video.numOfViews % 1000 === 0) {
      const rate =
        await connection.exchangeRateRepository.getCurrentRateRepository();
      await connection.userRepository.updateUserWalletRepository(
        video.user?._id,
        "ReceiveCoin",
        rate.coinPer1000View
      );
    }
    return video;
  } catch (error) {
    throw error;
  }
};

const getVideosByUserIdService = async (userId, query, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid user ID is required"
      );
    }

    if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid requester ID is required"
      );
    }

    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(requesterId);
      if (!requester) {
        throw new CoreException(StatusCodeEnums.NotFound_404, `Requester not found`);
      }
      if (requester.role === 1) {
        let { videos, total, page, totalPages } = await connection.videoRepository.getVideosByUserIdRepository(
          userId,
          query
        );
        return { videos, total, page, totalPages };
      }
    }

    const user = await connection.userRepository.getAnUserByIdRepository(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `User not found`);
    }

    // Handle case when user try to access private, unlisted, draft video of another user
    if (query.enumMode === "private" || query.enumMode === "unlisted" || query.enumMode === "draft") {
      query.enumMode = {
        $in: ['public', 'member']
      };
    }

    // Fetch all videos for the given userId
    let { videos, total, page, totalPages } = await connection.videoRepository.getVideosByUserIdRepository(
      userId,
      query
    );

    let filteredVideos = videos
      .map(async (video) => {
        const isOwner = video.user?._id?.toString() === requesterId?.toString();
        if (isOwner) {
          return video;
        }

        if (video.enumMode === "member") {
          const isMember = await checkMemberShip(requesterId, video.user?._id);
          if (isMember) {
            return video;
          }

          return updateVideosForNonMembership(
            [video],
            [video._id],
            "member"
          )[0];
        }

        return video;
      });

    const result = await Promise.all(filteredVideos);

    // Return the processed videos
    return { videos: result, total, page, totalPages };
  } catch (error) {
    throw new Error(
      `User not found`
    );
  }
};

const getVideoService = async (videoId, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      throw new CoreException(
        StatusCodes.BadRequest_400,
        "Valid video ID is required"
      );
    }

    if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid requester ID is required"
      );
    }

    if (requesterId) {
      const requester = await connection.userRepository.findUserById(requesterId);
      if (!requester) {
        throw new CoreException(StatusCodeEnums.NotFound_404, `Requester not found`);
      }
      if (requester.role === 1) {
        const video = await connection.videoRepository.getVideoRepository(videoId);
        return video;
      }
    }

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new Error(`Video not found`);
    }

    if (video.enumMode === "private") {
      if (requesterId?.toString() !== video.user?._id?.toString()) {
        const updatedVideos = updateVideosForNonMembership(
          [video],
          [video._id],
          "private"
        );
        return Array.isArray(updatedVideos) && updatedVideos.length === 1
          ? updatedVideos[0] // Return the single video object
          : updatedVideos; // Return the array if it's not of length 1
      }
      return video; // RequesterId is the owner, return the video
    } else if (video.enumMode === "member") {
      const isMember = await checkMemberShip(requesterId, video.user?._id);
      if (!isMember && requesterId?.toString() !== video.user?._id?.toString()) {
        //not member & not owner
        const updatedVideos = updateVideosForNonMembership(
          [video],
          [video._id],
          "member"
        );
        return Array.isArray(updatedVideos) && updatedVideos.length === 1
          ? updatedVideos[0] // Return the single video object
          : updatedVideos; // Return the array if it's not of length 1
      } else {
        return video;
      }
    } else if (video.enumMode === "draft") {
      if (requesterId?.toString() !== video.user?._id?.toString()) {
        throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found")
      }
    }

    return video;
  } catch (error) {
    throw error;
  }
};

const getVideosService = async (query, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid requester ID is required"
      );
    }

    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(requesterId);
      if (!requester) {
        throw new CoreException(StatusCodeEnums.NotFound_404, `Requester not found`);
      }
      if (requester.role === 1) {
        let { videos, total, page, totalPages } = await connection.videoRepository.getAllVideosRepository(query);
        return { videos, total, page, totalPages };
      }
    }

    // Handle case when user try to access private, unlisted, draft video of another user
    if (query.enumMode === "private" || query.enumMode === "unlisted" || query.enumMode === "draft") {
      query.enumMode = {
        $in: ['public', 'member']
      };
    }

    const { videos, total, page, totalPages } = await connection.videoRepository.getAllVideosRepository(query);

    let filteredVideos = videos
      .map(async (video) => {
        const isOwner = video.user?._id?.toString() === requesterId?.toString();
        if (isOwner) {
          return video;
        }

        if (video.enumMode === "member") {
          const isMember = await checkMemberShip(requesterId, video.user?._id);
          if (isMember) {
            return video;
          }

          return updateVideosForNonMembership(
            [video],
            [video._id],
            "member"
          )[0];
        }

        return video;
      });

    const result = await Promise.all(filteredVideos);

    return { videos: result, total, page, totalPages };
  } catch (error) {
    throw error;
  }
};

const getVideosByPlaylistIdService = async (
  playlistId,
  query,
  requester,
) => {
  try {
    const connection = new DatabaseTransaction();

    // Fetch videos by playlist from the repository
    const videos =
      await connection.videoRepository.getVideosByPlaylistIdRepository(
        playlistId,
        query
      );

    // Step 1: Group videos by userId
    const videosByOwner = videos.data.reduce((acc, video) => {
      if (!acc[video.user?._id]) {
        acc[video.user?._id] = [];
      }
      acc[video.user?._id].push(video);
      return acc;
    }, {});

    // Step 2: Iterate over each unique user (owner)
    const resultVideos = [];

    for (let [userId, userVideos] of Object.entries(videosByOwner)) {
      const isOwner = requester?.toString() === userId?.toString();

      // Step 3: Filter out private videos if the requester is not the owner
      let processedVideos = userVideos.filter(
        (video) => video.enumMode !== "private" || isOwner
      );

      // Step 4: Handle member-only videos
      const memberVideoIds = processedVideos
        .filter((video) => video.enumMode === "member")
        .map((video) => video._id);

      // Step 5: If the requester is not the owner and not a member, modify member-only videos
      if (!isOwner && memberVideoIds.length > 0) {
        const isMember = await checkMemberShip(requester, userId);

        // If the requester is not a member, process member-only videos
        if (!isMember) {
          processedVideos = updateVideosForNonMembership(
            processedVideos,
            memberVideoIds,
            "member" // Mark member videos with a "This video requires membership" message
          );
        }
      }

      // Step 6: Add the processed (or unprocessed for owners) videos to the result
      resultVideos.push(...processedVideos);
    }

    // Step 7: Return the final processed videos
    return resultVideos;
  } catch (error) {
    throw new Error(
      `Error fetching videos for playlist ${playlistId}: ${error.message}`
    );
  }
};

// Add admin delete
const deleteVideoService = async (videoId, userId) => {
  const connection = new DatabaseTransaction();

  try {
    const session = await connection.startTransaction();

    const video = await connection.videoRepository.getVideoRepository(
      videoId,
      session
    );
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    const notAdmin = user.role !== UserEnum.ADMIN;
    if (!video || video.isDeleted === true) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `Video not found`);
    }

    if (video.user?._id?.toString() !== userId && notAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const result = await connection.videoRepository.deleteVideoRepository(
      video._id,
      session
    );

    if ((result.deletedCount = 0)) {
      throw new CoreException(
        StatusCodeEnums.NoContent_204,
        "Failed to delete video. Video not found"
      );
    }

    await deleteBunnyStorageFileService(videoId);

    await connection.commitTransaction();

    return result;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  }
};

// Modified url with custom message to ensure privacy
const updateVideosForNonMembership = (videos, videoIds, type) => {
  // Iterate through the array of videos and modify if the _id is found in videoIds
  return videos.map((video) => {
    let content;
    if (type === "member") {
      content = `This video requires membership`;
    } else {
      content = "This video is private";
    }
    if (videoIds.includes(video._id)) {
      // If the video ID is in the list, update the specific fields
      return {
        ...video, // Keep all other properties the same
        videoUrl: content,
      };
    }
    // If the ID is not found, return the video object unchanged
    return video;
  });
};

const checkMemberShip = async (requester, userId) => {
  try {
    const connection = new DatabaseTransaction();
    const memberGroup =
      await connection.memberGroupRepository.getMemberGroupRepository(userId);

    // If no member group or members array is empty, return false
    if (!memberGroup || memberGroup.members.length === 0) {
      return false;
    }
    // Use 'some' to check if the requester is a member
    let isMember = false;
    memberGroup.members.map((member) => {
      if (member.memberId?.toString() === requester) {
        isMember = true;
      }
    });

    return isMember; // Return true if found, otherwise false
  } catch (error) {
    throw error; // Handle the error appropriately in your app
  }
};

const getVideoLikeHistoryService = async (userId) => {
  try {
    const connection = new DatabaseTransaction();

    const videos =
      await connection.videoRepository.getVideoLikeHistoryRepository(userId);

    let filteredVideos = videos
      .map(async (video) => {
        const isOwner = video.user?._id?.toString() === userId?.toString();
        if (isOwner) {
          return video;
        }

        if (video.enumMode === "member") {
          const isMember = await checkMemberShip(userId, video.user?._id);
          if (isMember) {
            return video;
          }

          return updateVideosForNonMembership(
            [video],
            [video._id],
            "member"
          )[0];
        }

        return video;
      });

    const result = await Promise.all(filteredVideos);

    return result;
  } catch (error) {
    throw error;
  }
};

const getVideoLikesCountService = async (videoId) => {
  try {
    const connection = new DatabaseTransaction();

    if (videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid video ID is required"
      );
    }

    const videos =
      await connection.videoRepository.getVideoLikeHistoryRepository(videoId);

    return videos;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createVideoService,
  updateAVideoByIdService,
  createVideoService,
  updateAVideoByIdService,
  toggleLikeVideoService,
  getVideosByUserIdService,
  getVideosByPlaylistIdService,
  viewIncrementService,
  deleteVideoService,
  getVideoService,
  getVideosService,
  getVideoLikeHistoryService,
};
