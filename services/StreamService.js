const StatusCodeEnums = require("../enums/StatusCodeEnum.js");
const CoreException = require("../exceptions/CoreException.js");
const DatabaseTransaction = require("../repositories/DatabaseTransaction.js");

const getStreamUrlService = async (streamId) => {
  try {
    const connection = new DatabaseTransaction();
    const stream = await connection.streamRepository.getStreamById(streamId);

    return stream.streamUrl;
  } catch (error) {
    throw error;
  }
};

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

const updateStreamService = async (streamId, updateData, categoryData) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.getStreamRepository(streamId);

    if (!stream) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Stream not found");
    }

    const updatedData = await connection.streamRepository.updateStreamRepository(streamId, updateData, categoryData);

    return updatedData;
  } catch (error) {
    throw error;
  }
};

const deleteStreamService = async (streamId) => {
  try {
    const connection = new DatabaseTransaction();

    const stream = await connection.streamRepository.deleteStreamRepository(streamId);

    return stream;
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
  getStreamUrlService,
  createStreamService,
};
