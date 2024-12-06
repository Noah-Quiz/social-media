require("dotenv").config();
const { default: axios } = require("axios");
const fs = require("fs");
const getLogger = require("../utils/logger");
const {
  deleteFile,
  extractFilenameFromPath,
  deleteFolder,
} = require("../middlewares/storeFile");
const logger = getLogger("BUNNY_STREAM");
const eventEmitter = require("../socket/events");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const uploadBunnyStorageFileService = async ({
  userId,
  videoId,
  videoFolderPath,
}) => {
  try {
    const files = fs.readdirSync(videoFolderPath);
    const filteredFiles = files.filter((file) => file.includes(videoId));
    const totalFiles = filteredFiles.length; // Total number of files to upload
    let uploadedFilesCount = 0; // Count of successfully uploaded files
    for (const file of filteredFiles) {
      const filePath = `${videoFolderPath}/${file}`;

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
        if (fileName.includes(".m3u8") && fileName.endsWith(".m3u8")) {
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
        } else if (fileName.includes(".png")) {
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

module.exports = {
  deleteBunnyStorageFileService,
  uploadBunnyStorageFileService,
};
