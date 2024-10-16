require("dotenv").config();
const { default: axios } = require("axios");
const fs = require("fs");
const getLogger = require("../utils/logger");
const logger = getLogger("BUNNY_STREAM");

const getBunnyStreamVideoService = async (libraryId, videoId) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos/${videoId}`;
    const res = await axios.get(url, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
      },
    });
    logger.info(`Get video response: ${JSON.stringify(res.data)}`);
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Get video error: ${error}`);
    throw error;
  }
};

const getAllBunnyStreamVideosService = async (
  libraryId,
  page,
  itemsPerPage,
  search,
  collection,
  orderBy
) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos?page=${page}&itemsPerPage=${itemsPerPage}&search=${search}&collection=${collection}&orderBy=${orderBy}`;
    const res = await axios.get(url, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
      },
    });
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Get videos error: ${error}`);
    throw error;
  }
};

const createBunnyStreamVideoService = async (
  libraryId,
  title,
  collectionId,
  thumbnailTime // Video time in ms to extract the main video thumbnail.
) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos`;
    const formData = new FormData();
    formData.append("title", title);
    if (collectionId) formData.append("collectionId", collectionId);
    if (thumbnailTime) formData.append("thumbnailTime", thumbnailTime);

    const res = await axios.post(url, formData, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
        "Content-Type": "application/json",
      },
    });
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Create video error: ${error}`);
    throw error;
  }
};

const uploadBunnyStreamVideoService = async (libraryId, videoId, filePath) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos/${videoId}`;
    const fileStream = fs.createReadStream(filePath);
    const res = await axios.put(url, fileStream, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: 2 * 1024 * 1024 * 1024, // 2GB
    });
    logger.info(`Upload video response: ${JSON.stringify(res.data)}`);
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Upload video error: ${error}`);
    throw error;
  }
};

const deleteBunnyStreamVideoService = async (libraryId, videoId) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos/${videoId}`;
    const res = await axios.delete(url, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
      },
    });
    logger.info(`Get video response: ${JSON.stringify(res.data)}`);
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Get video error: ${error}`);
    throw error;
  }
};

module.exports = {
  getBunnyStreamVideoService,
  getAllBunnyStreamVideosService,
  createBunnyStreamVideoService,
  uploadBunnyStreamVideoService,
  deleteBunnyStreamVideoService,
};
