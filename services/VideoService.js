const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const { deleteBunnyStorageFileService } = require("./BunnyStreamService");
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

const updateAVideoByIdService = async (
  videoId,
  userId,
  data,
  thumbnailFile
) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    // if (userId?.toString() !== video?.user?._id?.toString()) {
    //   throw new CoreException(
    //     StatusCodeEnums.BadRequest_400,
    //     "You do not have permission to perform this action"
    //   );
    // }

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

const toggleLikeVideoService = async (videoId, userId) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserById(userId);
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const video = await connection.videoRepository.getVideoByIdRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if ((video.enumMode === "private" || video.enumMode === "draft") && user.role !== UserEnum.ADMIN && video.user?._id?.toString() !== userId?.toString()) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }
    
    // Prevent like on draft video
    if (video.enumMode === "draft") {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "Likes are disabled on draft video");
    }

    const videoOwnerId = video.user?._id;

    const action = await connection.videoRepository.toggleLikeVideoRepository(
      videoId,
      userId
    );

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

    return action;
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
      const requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          `Requester not found`
        );
      }

      // Requester is ADMIN
      if (requester.role === UserEnum.ADMIN) {
        let { videos, total, page, totalPages } =
          await connection.videoRepository.getVideosByUserIdRepository(
            userId,
            query,
          );
        return { videos, total, page, totalPages };
      }

      // Requester is video owner
      const isOwner = userId?.toString() === requesterId?.toString();
      if (isOwner) {
        if (typeof query.enumMode !== "string") {
          query.enumMode = null;
        }

        let { videos, total, page, totalPages } =
          await connection.videoRepository.getVideosByUserIdRepository(
            userId,
            query,
            requesterId
          );
        return { videos, total, page, totalPages };
      }
    }

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    
    if (user === null) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `User not found`);
    }

    // Handle case when user try to access private, unlisted, draft video of another user
    if (
      query.enumMode === "private" ||
      query.enumMode === "unlisted" ||
      query.enumMode === "draft"
    ) {
      query.enumMode = {
        $in: ["public", "member"],
      };
    }

    // Fetch all videos for the given userId
    let { videos, total, page, totalPages } =
      await connection.videoRepository.getVideosByUserIdRepository(
        userId,
        query,
        requesterId
      );

    let filteredVideos = videos.map(async (video) => {
      const isOwner = video.user?._id?.toString() === requesterId?.toString();
      if (isOwner) {
        return video;
      }

      if (video.enumMode === "member") {
        const isMember = await checkMemberShip(requesterId, video.user?._id);
        if (isMember) {
          return video;
        }

        return updateVideosForNonMembership([video], [video._id], "member")[0];
      }

      return video;
    });

    const result = await Promise.all(filteredVideos);

    // Return the processed videos
    return { videos: result, total, page, totalPages };
  } catch (error) {
    throw error;
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
      const requester = await connection.userRepository.findUserById(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          `Requester not found`
        );
      }
      if (requester.role === UserEnum.ADMIN) {
        const video = await connection.videoRepository.getVideoRepository(
          videoId
        );
        return video;
      }
    }

    const video = await connection.videoRepository.getVideoRepository(videoId, requesterId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `Video not found`);
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
      if (
        !isMember &&
        requesterId?.toString() !== video.user?._id?.toString()
      ) {
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
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Video not found"
        );
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
      const requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          `Requester not found`
        );
      }
      if (requester.role === UserEnum.ADMIN) {
        let { videos, total, page, totalPages } =
          await connection.videoRepository.getAllVideosRepository(query, requesterId);
        return { videos, total, page, totalPages };
      }
    }

    // Handle case when user try to access private, unlisted, draft video of another user
    if (
      query.enumMode === "private" ||
      query.enumMode === "unlisted" ||
      query.enumMode === "draft"
    ) {
      query.enumMode = {
        $in: ["public", "member"],
      };
    }

    const { videos, total, page, totalPages } =
      await connection.videoRepository.getAllVideosRepository(query, requesterId);

    let filteredVideos = videos.map(async (video) => {
      const isOwner = video.user?._id?.toString() === requesterId?.toString();
      if (isOwner) {
        return video;
      }

      if (video.enumMode === "member") {
        const isMember = await checkMemberShip(requesterId, video.user?._id);
        if (isMember) {
          return video;
        }

        return updateVideosForNonMembership([video], [video._id], "member")[0];
      }

      return video;
    });

    const result = await Promise.all(filteredVideos);

    return { videos: result, total, page, totalPages };
  } catch (error) {
    throw error;
  }
};

const getVideosByPlaylistIdService = async (playlistId, query, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid playlist ID is required"
      );
    }

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Valid requester ID is required"
      );
    }

    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          `Requester not found`
        );
      }
      if (requester.role === UserEnum.ADMIN) {
        let { videos, total, page, totalPages } =
          await connection.videoRepository.getVideosByPlaylistIdRepository(
            playlistId,
            query
          );
        return { videos, total, page, totalPages };
      }
    }

    // Handle case when user try to access private, unlisted, draft video of another user
    if (
      query.enumMode === "private" ||
      query.enumMode === "unlisted" ||
      query.enumMode === "draft"
    ) {
      query.enumMode = {
        $in: ["public", "member"],
      };
    }

    const { videos, total, page, totalPages } =
      await connection.videoRepository.getVideosByPlaylistIdRepository(
        playlistId,
        query,
        requesterId
      );

    let filteredVideos = videos.map(async (video) => {
      const isOwner = video.user?._id?.toString() === requesterId?.toString();
      if (isOwner) {
        return video;
      }

      if (video.enumMode === "member") {
        const isMember = await checkMemberShip(requesterId, video.user?._id);
        if (isMember) {
          return video;
        }

        return updateVideosForNonMembership([video], [video._id], "member")[0];
      }

      return video;
    });

    const result = await Promise.all(filteredVideos);

    return { videos: result, page, total, totalPages };
  } catch (error) {
    throw error;
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

    let filteredVideos = videos.map(async (video) => {
      const isOwner = video.user?._id?.toString() === userId?.toString();
      if (isOwner) {
        return video;
      }

      if (video.enumMode === "member") {
        const isMember = await checkMemberShip(userId, video.user?._id);
        if (isMember) {
          return video;
        }

        return updateVideosForNonMembership([video], [video._id], "member")[0];
      }

      return video;
    });

    const result = await Promise.all(filteredVideos);

    return result;
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
