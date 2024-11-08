require("dotenv").config();
const { default: axios } = require("axios");
const fs = require("fs");
const getLogger = require("../utils/logger");
const {
  deleteFile,
  extractFilenameFromPath,
  deleteFolder,
} = require("../middlewares/storeFile");
const logger = getLogger("BUNNY_STREAM_SERVICE");
const eventEmitter = require("../socket/events");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const getBunnyStreamVideoService = async (libraryId, videoId) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos/${videoId}`;
    console.log(url);
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

const uploadBunnyStorageFileService = async ({
  userId,
  videoId,
  videoFolderPath,
}) => {
  try {
    logger.info(`Uploading video to Bunny Storage: ${videoFolderPath}`);
    const files = fs.readdirSync(videoFolderPath);
    const filteredFiles = files.filter(file => file.includes(videoId));
    const totalFiles = filteredFiles.length; // Total number of files to upload
    let uploadedFilesCount = 0; // Count of successfully uploaded files
    for (const file of filteredFiles) {
      const filePath = `${videoFolderPath}/${file}`;
      console.log(filePath);
      const fileStream = fs.createReadStream(filePath);
      const fileName = await extractFilenameFromPath(filePath);

      const url = `https://${process.env.BUNNY_STORAGE_HOST_NAME}/${process.env.BUNNY_STORAGE_ZONE_NAME}/video/${videoId}/${fileName}`;
      const res = await axios.put(url, fileStream, {
        headers: {
          AccessKey: process.env.BUNNY_STORAGE_PASSWORD,
          "Content-Type": "application/octet-stream",
        },
        maxBodyLength: Infinity,
      });

      if (res.status === StatusCodeEnums.Created_201) {
        logger.info(`Upload video response: ${JSON.stringify(res.data)}`);
        if (fileName.includes(".m3u8")) {
          const connection = new DatabaseTransaction();
          const video = await connection.videoRepository.getVideoByIdRepository(
            videoId
          );
          if (video) {
            await connection.videoRepository.updateAVideoByIdRepository(
              videoId,
              {
                videoUrl: `https://${process.env.BUNNY_DOMAIN_STORAGE_ZONE}/video/${videoId}/${fileName}`,
              }
            );
          }
        }else if(fileName.includes(".png")){
          const connection = new DatabaseTransaction();
          const video = await connection.videoRepository.getVideoByIdRepository(
            videoId
          );
          if (video) {
            await connection.videoRepository.updateAVideoByIdRepository(
              videoId,
              {
                thumbnailUrl: `https://${process.env.BUNNY_DOMAIN_STORAGE_ZONE}/video/${videoId}/${fileName}`,
              }
            );
          }
        }
        uploadedFilesCount++;
        const uploadPercentage = (
          (uploadedFilesCount / totalFiles) *
          100
        ).toFixed(2);
        logger.info(`Upload percentage: ${uploadPercentage}%`);
        eventEmitter.emit("upload_video_progress", {
          userId: userId,
          progress: uploadPercentage,
        });
      }
    }
    await deleteFolder(videoFolderPath);
  } catch (error) {
    logger.error(`Upload video error: ${error}`);
    throw error;
  }
};
const deleteBunnyStorageFileService = async (videoId) => {
  try {
    const url = `https://${process.env.BUNNY_STORAGE_HOST_NAME}/${process.env.BUNNY_STORAGE_ZONE_NAME}/video/${videoId}/.`;
    logger.info(url);
    const res = await axios.delete(url, {
      headers: {
        AccessKey: process.env.BUNNY_STORAGE_PASSWORD,
      },
    });
    logger.info(`Delete video response: ${JSON.stringify(res.data)}`);
  } catch (error) {
    logger.error(`Delete video error: ${error}`);
    throw error;
  }
};
const uploadBunnyStreamVideoService = async (userId, videoId, filePath) => {
  try {
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${process.env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/videos/${videoId}`;
    logger.info(`Uploading video to Bunny Stream: ${url}`);
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    const res = await axios.put(url, fileStream, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        const progress = ((progressEvent.loaded / fileSize) * 100).toFixed(2);
        console.log(`Uploading: ${progress}%`);
        eventEmitter.emit("upload_progress", {
          videoId,
          progress,
        });
      },
    });
    logger.info(`Upload video response: ${JSON.stringify(res.data)}`);
    await deleteFile(filePath);
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Upload video error: ${error}`);
    throw error;
  }
};

const updateBunnyStreamVideoService = async (libraryId, videoId, title) => {
  try {
    logger.info(`Updating video: ${videoId}`);
    const url = `${process.env.BUNNY_STREAM_VIDEO_API_URL}/library/${libraryId}/videos/${videoId}`;
    const formData = new FormData();
    formData.append("title", title);
    const res = await axios.post(url, formData, {
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
        "Content-Type": "application/json",
      },
    });
    logger.info(`Update video response: ${JSON.stringify(res.data)}`);
    return JSON.parse(JSON.stringify(res.data));
  } catch (error) {
    logger.error(`Update video error: ${error}`);
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
  deleteBunnyStorageFileService,
  uploadBunnyStorageFileService,
  updateBunnyStreamVideoService,
  deleteBunnyStreamVideoService,
};
