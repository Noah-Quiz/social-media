const StatusCodeEnums = require("../enums/StatusCodeEnum.js");
const CoreException = require("../exceptions/CoreException.js");
const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");

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

    if (stream.userId.toString() !== userId) {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "You do not have permission to perform this action");
    }

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    const updatedData = await connection.streamRepository.updateStreamRepository(streamId, updateData, categoryData);

    return updatedData;
  } catch (error) {
    throw error;
  }
};

const deleteStreamService = async (userId, streamId) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(streamId);

    if (stream.userId.toString() !== userId) {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "You do not have permission to perform this action");
    }

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    await connection.streamRepository.deleteStreamRepository(streamId);

    return true;
  } catch (error) {
    throw error;
  }
};

const endStreamService = async (streamId) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.endStreamRepository(streamId);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    return stream;
  } catch (error) {
    throw error;
  }
};

const createStreamService = async (data) => {
  try {
    const connection = new DatabaseTransaction();

    const result = await connection.streamRepository.createStreamRepository(data);
    return result;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  getStreamService,
  getStreamsService,
  endStreamService,
  updateStreamService,
  deleteStreamService,
  createStreamService,
};
