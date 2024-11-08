const { default: axios } = require("axios");
const Stream = require("../entities/StreamEntity.js");
const StatusCodeEnums = require("../enums/StatusCodeEnum.js");
const CoreException = require("../exceptions/CoreException.js");
const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");
const { default: mongoose } = require("mongoose");

const streamServerBaseUrl = process.env.STREAM_SERVER_BASE_URL;

const getStreamService = async (streamId, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Valid stream ID is required");
    }

    if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Valid requester ID is required");
    }
    // If requester is admin, return stream
    if (requesterId) {
      const requester =  await connection.userRepository.findUserById(requesterId);
      if (!requester) {
        throw new CoreException(StatusCodeEnums.NotFound_404, `Requester not found`);
      }
      if (requester.role === 1) {
        const stream = await connection.streamRepository.getStreamRepository(
          streamId
        );
        return stream;
      }
    }

    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    let process = stream;
    const isOwner = stream.user?._id?.toString() === requesterId?.toString();

    //if owner => nothing is change
    if (isOwner) {
      return process;
    }

    //if not owner => check private stream
    process = cleanStreamFromNonOwner(stream);
    if (stream.enumMode === "member") {
      // Handle not owner member
      const isMember = await checkMemberShip(requesterId, stream.user?._id);

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

const getStreamsService = async (query, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
      throw new CoreException(StatusCodeEnums.BadRequest_400, "Valid requester ID is required");
    }

    // If requester is admin, return all streams
    if (requesterId) {
      const requester =  await connection.userRepository.findUserById(requesterId);
      if (!requester) {
        throw new CoreException(StatusCodeEnums.NotFound_404, `Requester not found`);
      }
      if (requester.role === 1) {
        const streams = await connection.streamRepository.getStreamsRepository(query);
        return streams;
      }
    }

    const data = await connection.streamRepository.getStreamsRepository(query);

    let streams = data.streams
      .map(async (stream) => {
        const isOwner = stream.user?._id?.toString() === requesterId?.toString();
        if (isOwner) {
          return stream; 
        }

        let cleanedStream = cleanStreamFromNonOwner(stream);

        if (stream.enumMode === "member") {
          const isMember = await checkMemberShip(requesterId, stream.user?._id);
          if (isMember) {
            return cleanedStream;
          }

          return updateStreamForNonMembership(
            [cleanedStream],
            [cleanedStream._id],
            "member"
          )[0];
        }

        return cleanedStream; 
      });

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

    if (stream.user?._id?.toString() !== userId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }
    
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

    if (stream.user?._id?.toString() !== userId) {
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

const toggleLikeStreamService = async (streamId, userId) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(
      streamId
    );

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    const action = await connection.streamRepository.toggleLikeStreamRepository(
      streamId,
      userId
    );

    return action;
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
      if (member.memberId?.toString() === requester) {
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
