const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { uploadThumbnail, uploadFiles } = require("../middlewares/LoadFile");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const crypto = require("crypto");
const createVideoService = async (
  userId,
  {
    title,
    description,
    enumMode,
    categoryIds,
    bunnyId,
    videoUrl,
    videoEmbedUrl,
  }
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
      description,
      categoryIds,
      enumMode,
      videoUrl,
      videoEmbedUrl,
      bunnyId,
    });

    return video;
  } catch (error) {
    throw error;
  }
};

const uploadVideoService = async (
  videoId,
  userId,
  videoFilePath,
  videoThumbnailFilePath
) => {
  try {
    const connection = new DatabaseTransaction();
    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }
    if (video.userId.toString() !== userId.toString()) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    if (video.isUploaded === true) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Video is already uploaded"
      );
    }
    video.isUploaded = true;
    video.videoServerUrl = videoFilePath;
    video.thumbnailUrl = videoThumbnailFilePath;
    await connection.videoRepository.updateAVideoByIdRepository(videoId, video);
    return video;
  } catch (error) {
    throw error;
  }
};

const generateVideoEmbedUrlToken = async (videoId, dateExpire) => {
  try {
    const connection = new DatabaseTransaction();
    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }
    const input = `${process.env.BUNNY_STREAM_TOKEN_AUTHENTICATION_KEY}${video.bunnyId}${dateExpire}`;
    const hash = crypto.createHash("sha256").update(input).digest("hex");
    const url = new URL(video.videoEmbedUrl);
    url.searchParams.set("token", hash);
    url.searchParams.set("expires", dateExpire);
    await connection.videoRepository.updateAVideoByIdRepository(videoId, {
      videoEmbedUrl: url.toString(),
    });
  } catch (error) {
    throw error;
  }
};

const updateAVideoByIdService = async (videoId, data, thumbnailFile) => {
  try {
    if (
      data.enumMode &&
      !["public", "private", "unlisted"].includes(data.enumMode)
    ) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Invalid video accessibility"
      );
    }

    const categoryIds = data.categoryIds;
    if (categoryIds && !Array.isArray(categoryIds)) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "CategoryIds must be an array"
      );
    }
    if (categoryIds && categoryIds.length !== 0) {
      categoryIds.forEach((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new CoreException(
            StatusCodeEnums.BadRequest_400,
            `Invalid category ID`
          );
        }
      });
    }

    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    if (thumbnailFile) {
      // const vimeoVideoId = video.videoUrl.split("/").pop();
      // const thumbnailUrl = await uploadThumbnail(
      //   `/videos/${vimeoVideoId}`,
      //   thumbnailFile
      // );
      data.thumbnailUrl = thumbnailFile.path;
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
      throw new CoreException(StatusCodeEnum.NotFound_404, "Video not found");
    }

    const videoOwnerId = video.userId;

    const allowedActions = ["like", "unlike"];
    if (!allowedActions.includes(action)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid action");
    }

    const result = await connection.videoRepository.toggleLikeVideoRepository(
      videoId,
      userId,
      action
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
        video.userId,
        "ReceiveCoin",
        rate.coinPer1000View
      );
    }
    return video;
  } catch (error) {
    throw error;
  }
};

const getVideosByUserIdService = async (userId, sortBy, requester) => {
  try {
    const connection = new DatabaseTransaction();

    // Fetch all videos for the given userId
    let videos = await connection.videoRepository.getVideosByUserIdRepository(
      userId,
      sortBy
    );

    // If requester is the owner, return all videos unmodified (owner has full access)
    if (userId === requester) {
      return videos;
    }

    // Filter out private videos that are not owned by the requester
    let processedVideos = videos.filter(
      (video) =>
        video.enumMode !== "private" ||
        video.userId.toString() === requester.toString()
    );

    // Handle member-only videos
    const memberVideoIds = processedVideos
      .filter((video) => video.enumMode === "member")
      .map((video) => video._id);

    const isMember = await checkMemberShip(requester, userId);

    // If the requester is not a member, process member-only videos
    if (!isMember) {
      processedVideos = updateVideosForNonMembership(
        processedVideos,
        memberVideoIds,
        "member" // Mark member videos with a "This video requires membership" message
      );
    }

    // Return the processed videos
    return processedVideos;
  } catch (error) {
    throw new Error(
      `Error fetching videos for user ${userId}: ${error.message}`
    );
  }
};

const getVideoService = async (videoId, requester) => {
  try {
    const connection = new DatabaseTransaction();

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new Error(`Video with id ${videoId} does not exist`);
    }
    if (video.enumMode === "private") {
      if (requester.toString() !== video.userId.toString()) {
        const updatedVideos = updateVideosForNonMembership(
          [video],
          [video._id],
          "private"
        );
        return Array.isArray(updatedVideos) && updatedVideos.length === 1
          ? updatedVideos[0] // Return the single video object
          : updatedVideos; // Return the array if it's not of length 1
      }
      return video; // Requester is the owner, return the video
    } else if (video.enumMode === "member") {
      const isMember = await checkMemberShip(requester, video.userId);
      if (!isMember && requester.toString() !== video.userId.toString()) {
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
    }
    return video;
  } catch (error) {
    throw error;
  }
};

const getVideosService = async (query) => {
  try {
    const connection = new DatabaseTransaction();

    const { videos, total, page, totalPages } =
      await connection.videoRepository.getAllVideosRepository(query);

    return { videos, total, page, totalPages };
  } catch (error) {
    throw error;
  }
};

const getVideosByPlaylistIdService = async (
  playlistId,
  page,
  size,
  requester
) => {
  try {
    const connection = new DatabaseTransaction();

    // Fetch videos by playlist from the repository
    const videos =
      await connection.videoRepository.getVideosByPlaylistIdRepository(
        playlistId,
        page,
        size
      );

    // Step 1: Group videos by userId
    const videosByOwner = videos.data.reduce((acc, video) => {
      if (!acc[video.userId]) {
        acc[video.userId] = [];
      }
      acc[video.userId].push(video);
      return acc;
    }, {});

    // Step 2: Iterate over each unique user (owner)
    const resultVideos = [];

    for (let [userId, userVideos] of Object.entries(videosByOwner)) {
      const isOwner = requester.toString() === userId.toString();

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

//add admin delete
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
    const notAdmin = user.role !== 1;
    if (!video || video.isDeleted === true) {
      throw new CoreException(StatusCodeEnums.NotFound_404, `Video not found`);
    }

    if (video.userId.toString() !== userId && notAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    // let vimeoVideoId = video.videoUrl.split("/").pop();
    // const response = await axios.delete(
    //   `https://api.vimeo.com/videos/${vimeoVideoId}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
    //     },
    //   }
    // );

    // if (response.status !== 204) {
    //   throw new CoreException(
    //     StatusCodeEnums.NoContent_204,
    //     "Failed to delete video on Vimeo. Video not found"
    //   );
    // }

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

    await connection.commitTransaction();

    return result;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  }
};
const updateVideosForNonMembership = (videos, videoIds, type) => {
  // Iterate through the array of videos and modify if the _id is found in videoIds
  return videos.map((video) => {
    let content;
    if (type === "member") {
      content = `This video requires membership`;
    } else {
      content = "this is a private video";
    }
    if (videoIds.includes(video._id)) {
      // If the video ID is in the list, update the specific fields
      return {
        ...video, // Keep all other properties the same
        videoUrl: content,
        videoEmbedUrl: content,
        videoServerUrl: content,
        embedUrl: content,
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
      if (member.memberId.toString() === requester) {
        isMember = true;
      }
    });

    return isMember; // Return true if found, otherwise false
  } catch (error) {
    throw error; // Handle the error appropriately in your app
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
  uploadVideoService,
  generateVideoEmbedUrlToken,
};
