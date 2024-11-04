const { default: axios } = require("axios");
const Stream = require("../entities/StreamEntity.js");
const StatusCodeEnums = require("../enums/StatusCodeEnum.js");
const CoreException = require("../exceptions/CoreException.js");
const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");

const streamServerBaseUrl = process.env.STREAM_SERVER_BASE_URL;

const getStreamService = async (streamId, requester) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    let process = stream;
    const isOwner = stream?.userId?.toString() === requester?.toString();

    //if owner => nothing is change
    if (isOwner) {
      return process;
    }

    //if not owner => check private stream
    process = cleanStreamFromNonOwner(stream);
    if (stream.enumMode === "private") {
      //handle not owner private
      const result = updateStreamForNonMembership(
        [process],
        [process._id],
        "private"
      );
      return result.length === 1 ? result[0] : result;
    } else if (stream.enumMode === "member") {
      //handle not owner member
      const isMember = await checkMemberShip(requester, stream.userId);

      if (isMember) {
        return process;
      }

      const result = updateStreamForNonMembership(
        [process],
        [process._id],
        "member"
      );

      return result.length === 1 ? result[0] : result;
    }

    return process;
  } catch (error) {
    throw error;
  }
};
const getStreamsService = async (query, requester) => {
  const connection = new DatabaseTransaction();
  try {
    const data = await connection.streamRepository.getStreamsRepository(
      query,
      requester
    );

    let streams = data.streams
      .filter(
        (stream) =>
          stream.enumMode !== "private" ||
          stream.userId?.toString() === requester.toString()
      )
      .map(async (stream) => {
        const isOwner = stream.userId?.toString() === requester.toString();
        if (isOwner) {
          return stream; // Return unmodified stream if requester is owner
        }

        // Clean stream for non-owner
        let cleanedStream = cleanStreamFromNonOwner(stream);

        // Check if stream is member-only
        if (stream.enumMode === "member") {
          const isMember = await checkMemberShip(requester, stream.userId);
          if (isMember) {
            return cleanedStream; // Return cleaned stream for members
          }

          // Handle non-member users, update the stream for non-members
          return updateStreamForNonMembership(
            [cleanedStream],
            [cleanedStream._id],
            "member"
          )[0];
        }

        return cleanedStream; // Return cleaned stream for non-private non-members
      });

    // Since we have asynchronous map, we need to resolve all promises before returning
    const processedStreams = await Promise.all(streams);

    return { ...data, streams: processedStreams };
  } catch (error) {
    throw error;
  }
};

const updateStreamViewsService = async (streamId, currentViewCount) => {
  try {
    const stream = await Stream.findByIdAndUpdate(streamId, {
      $set: { currentViewCount: currentViewCount },
      $max: { peakViewCount: currentViewCount },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateStreamService = async (userId, streamId, updateData) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    if (stream.user._id.toString() !== userId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    console.log(updateData.thumbnailUrl);
    updateData.thumbnailUrl = `${process.env.APP_BASE_URL}/${updateData.thumbnailUrl}`;

    const updatedData =
      await connection.streamRepository.updateStreamRepository(
        streamId,
        updateData
      );

    return updatedData;
  } catch (error) {
    throw error;
  }
};

const deleteStreamService = async (userId, streamId) => {
  const connection = new DatabaseTransaction();
  try {
    const session = await connection.startTransaction();

    const user = await connection.userRepository.findUserById(userId);

    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    if (stream.userId.toString() !== userId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    await connection.streamRepository.deleteStreamRepository(streamId, session);

    try {
      await axios.delete(`${streamServerBaseUrl}/api/cloudflare/live-input`, {
        uid: stream.uid,
      });
    } catch (error) {
      throw error;
    }

    await connection.commitTransaction();
    return stream;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  } finally {
    await connection.endSession();
  }
};

const createStreamService = async (data) => {
  const connection = new DatabaseTransaction();
  const session = await connection.startTransaction();

  try {
    const stream = await connection.streamRepository.createStreamRepository(
      data,
      session
    );

    await connection.commitTransaction();

    return stream;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  } finally {
    await connection.endSession();
  }
};

const toggleLikeStreamService = async (streamId, userId, action) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    const allowedActions = ["like", "unlike"];
    if (!allowedActions.includes(action)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid action");
    }

    const result = await connection.streamRepository.toggleLikeStreamRepository(
      streamId,
      userId,
      action
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const getRecommendedStreamsService = async (data) => {
  try {
    const connection = new DatabaseTransaction();

    const result =
      await connection.streamRepository.getRecommendedStreamsRepository(data);

    return result;
  } catch (error) {
    throw error;
  }
};

const getRelevantStreamsService = async (data) => {
  try {
    const connection = new DatabaseTransaction();

    const result =
      await connection.streamRepository.getRelevantStreamsRepository(data);

    return result;
  } catch (error) {
    throw error;
  }
};
const cleanStreamFromNonOwner = (obj) => {
  const {
    uid,
    rtmps,
    rtmpsPlayback,
    srt,
    srtPlayback,
    webRTC,
    webRTCPlayback,
    ...cleanedObject
  } = obj;

  return cleanedObject;
};
const updateStreamForNonMembership = (streams, streamIds, type) => {
  // Iterate through the array of streams and modify if the _id is found in streamIds
  return streams.map((stream) => {
    let content;
    if (type === "member") {
      content = `This stream requires membership`;
    } else {
      content = "this is a private stream";
    }
    if (streamIds.includes(stream._id)) {
      // If the stream ID is in the list, update the specific fields
      return {
        ...stream, // Keep all other properties the same
        streamOnlineUrl: content,
        streamServerUrl: content,
      };
    }
    // If the ID is not found, return the stream object unchanged
    return stream;
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
  getStreamService,
  getStreamsService,
  updateStreamService,
  deleteStreamService,
  createStreamService,
  toggleLikeStreamService,
  updateStreamViewsService,
  getRecommendedStreamsService,
  getRelevantStreamsService,
};
