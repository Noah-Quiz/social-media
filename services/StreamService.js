const StatusCodeEnums = require("../enums/StatusCodeEnum.js");
const CoreException = require("../exceptions/CoreException.js");
const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");
const { deleteLiveStream, endStream, resetStreamKey, retrieveLiveStream, createLiveStream, retrieveAssetInputInfo, retrieveAsset } = require("../utils/muxLiveStream.js");

const getStreamService = async (streamId) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(streamId);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    return stream;
  } catch (error) {
    throw error;
  }
};

const getStreamsService = async (query) => {
  try {
    const connection = new DatabaseTransaction();

    const data = await connection.streamRepository.getStreamsRepository(query);

    return data;
  } catch (error) {
    throw error;
  }
};

const updateStreamService = async (userId, streamId, updateData, categoryData) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(streamId);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    if (stream.userId.toString() !== userId) {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "You do not have permission to perform this action");
    }

    const updatedData = await connection.streamRepository.updateStreamRepository(streamId, updateData, categoryData);

    return updatedData;
  } catch (error) {
    throw error;
  }
};

const deleteStreamService = async (userId, streamId) => {
  const connection = new DatabaseTransaction();
  const session = await connection.startTransaction();

  try {
    const stream = await connection.streamRepository.getStreamRepository(streamId);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    if (stream.userId.toString() !== userId) {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "You do not have permission to perform this action");
    }

    // Ending and deleting stream from MUX
    await endStream(stream.muxStreamId);
    await deleteLiveStream(stream.muxStreamId);

    await connection.streamRepository.deleteStreamRepository(streamId, session);

    await connection.commitTransaction();
    return true;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  } finally {
    await connection.endSession();
  }
};

const endStreamService = async (streamId) => {
  const connection = new DatabaseTransaction();
  const session = await connection.startTransaction();

  try {
    const stream = await connection.streamRepository.endStreamRepository(streamId, session);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    // Retrieve live stream info
    const muxStream = await retrieveLiveStream(stream.muxStreamId);

    // Retrieve live stream recording info
    const assetId = muxStream?.active_asset_id ? muxStream?.active_asset_id : muxStream?.recent_asset_ids[0];
    const asset = await retrieveAsset(assetId);
    const streamRecordingId = asset?.playback_ids[0]?.id;
    const streamRecodingUrl = `https://stream.mux.com/${streamRecordingId}.m3u8`

    // Ending and deleting live stream from MUX
    await endStream(stream.muxStreamId);
    await deleteLiveStream(stream.muxStreamId);

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

    // Create a live stream on MUX
    const response = await createLiveStream();
    data.streamUrl = response.stream_url;
    data.streamKey = response.stream_key;
    data.muxStreamId = response.id;
    data.muxPlaybackId = response.playback_id;

    const stream = await connection.streamRepository.createStreamRepository(data, session);

    await connection.commitTransaction();

    return stream;
  } catch (error) {
    await connection.abortTransaction();
    throw error;
  } finally {
    await connection.endSession();
  }
};

const resetStreamKeyService = async (streamId) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(streamId);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    const streamKey = await resetStreamKey(stream.muxStreamId);

    await connection.streamRepository.updateStreamRepository(streamId, { streamKey })

    return streamKey;
  } catch (error) {
    throw error;
  }
}


module.exports = {
  getStreamService,
  getStreamsService,
  endStreamService,
  updateStreamService,
  deleteStreamService,
  createStreamService,
  resetStreamKeyService,
};
