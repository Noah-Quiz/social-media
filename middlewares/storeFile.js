const { default: mongoose } = require("mongoose");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const getLogger = require("../utils/logger");
const logger = getLogger("FILE_UPLOAD");
const { spawn } = require("child_process");
require("dotenv").config();
const removeFileName = async (filePath) => {
  // Get the directory name by removing the file name
  return path.dirname(filePath);
};

const removeExtension = async (filePath) => {
  return path.join(path.dirname(filePath), path.parse(filePath).name);
};
const extractFilenameFromPath = async (filePath) => {
  try {
    // Use path.basename to get the filename from the given path
    const filename = path.basename(filePath);
    return filename;
  } catch (err) {
    console.error(`Error extracting filename from path: ${err.message}`);
    return null; // or handle error as needed
  }
};
const extractFilenameFromUrl = async (inputUrl) => {
  try {
    // Parse the URL
    const parsedUrl = new URL(inputUrl);

    // Get the pathname from the parsed URL
    const pathname = parsedUrl.pathname;

    // Use path.basename to extract the filename
    const filename = path.basename(pathname);

    return filename;
  } catch (err) {
    console.error(`Error extracting filename from URL: ${err.message}`);
    return null; // or handle error as needed
  }
};

const convertMp4ToHls = async (filePath) => {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;
    const outputDir = dirPath; // Directory to save the output
    const m3u8File = path.join(outputDir, `output_${baseName}.m3u8`); // M3U8 playlist file
    const segmentPath = path.join(outputDir, `${baseName}_%03d.ts`); // TS segment path

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Spawn FFmpeg process
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-i",
        filePath, // Input file
        "-c:v",
        "copy", // Copy video codec
        "-c:a",
        "copy", // Copy audio codec
        "-f",
        "hls", // Output format
        "-hls_time",
        "10", // Duration of each segment
        "-hls_list_size",
        "0", // All segments in playlist
        "-hls_flags",
        "split_by_time", // Split segments by time
        "-hls_segment_filename",
        segmentPath, // Segment filename pattern
        "-reset_timestamps",
        "1", // Reset timestamps for each segment
        m3u8File, // Output M3U8 file
      ],
      { detached: true, stdio: "ignore" }
    );

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        logger.info(`File converted to HLS: ${m3u8File}`);
        resolve(m3u8File);
      } else {
        logger.error(`FFmpeg process exited with code: ${code}`);
        reject(new Error(`FFmpeg process exited with code: ${code}`));
      }
    });

    ffmpeg.on("error", (err) => {
      logger.error(`Failed to start FFmpeg: ${err.message}`);
      reject(err);
    });
  });
};

const convertTsSegmentsToM3u8 = async (folderPath) => {
  return new Promise((resolve, reject) => {
    const absoluteFolderPath = path.resolve(folderPath);

    // Specify the output m3u8 file name
    const m3u8FilePath = path.join(absoluteFolderPath, "output.m3u8");

    // Collect all .ts files in the folder and sort them to maintain order
    const tsFiles = fs
      .readdirSync(absoluteFolderPath)
      .filter((file) => file.endsWith(".ts"))
      .sort(); // Sort if order matters

    if (tsFiles.length === 0) {
      return reject(new Error("No .ts files found in the folder"));
    }

    // Create the M3U8 playlist content
    let m3u8Content = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n`;

    tsFiles.forEach((file, index) => {
      // Get the duration of each TS file (optional, here it is hardcoded as 1 second)
      m3u8Content += `#EXTINF:10.000,\n${file}\n`;
    });

    // Mark the end of the playlist
    m3u8Content += `#EXT-X-ENDLIST`;

    // Write the M3U8 content to the output file
    fs.writeFileSync(m3u8FilePath, m3u8Content, { encoding: "utf8" });
    logger.info(`M3U8 playlist created at ${m3u8FilePath}`);

    resolve(m3u8FilePath);
  });
};

const replaceTsSegmentLinksInM3u8 = async (filePath, videoId) => {
  logger.info(`Replacing TS segment links in M3U8 file: ${filePath}`);

  // Update the URL to use BUNNY_DOMAIN_STORAGE_ZONE
  const url = `https://${process.env.BUNNY_DOMAIN_STORAGE_ZONE}/video/${videoId}/`;
  let m3u8Content = fs.readFileSync(filePath, { encoding: "utf8" });

  // logger.info(`Current M3U8 Content:\n${m3u8Content}`);

  // Adjust regex based on the actual TS file naming format
  const regex = new RegExp(`${videoId}[-\\w]+\\.ts`, "g");
  const matches = m3u8Content.match(regex);

  logger.info(`Regex pattern: ${regex}`);
  logger.info(`Matches found: ${matches ? matches.length : 0}`);

  // Replace TS segment links with the constructed URL
  m3u8Content = m3u8Content.replace(regex, (match) => {
    return `${url}${match}`; // Use the new base URL
  });

  fs.writeFileSync(filePath, m3u8Content);
  // logger.info(`Updated M3U8 Content:\n${m3u8Content}`);
};

const convertMp4ToTsSegments = async (filePath) => {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;
    const tsFilePattern = path.join(dirPath, `${baseName}_%03d.ts`);

    ffmpeg(filePath)
      .outputOptions(
        "-map",
        "0",
        "-segment_time",
        "10",
        "-f",
        "segment",
        "-reset_timestamps",
        "1"
      )
      .output(tsFilePattern)
      .on("end", () => {
        logger.info(`File converted to segments: ${tsFilePattern}`);
        resolve(`Segments created with pattern: ${tsFilePattern}`);
      })
      .on("error", (err) => {
        logger.error(`Failed to convert file: ${err.message}`);
        reject(err);
      })
      .run();
  });
};

const changeFileName = async (filePath, newName) => {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const ext = path.extname(filePath);
    const newFilePath = path.join(dirPath, newName + ext);

    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        logger.error(`Failed to change file name: ${err.message}`);
        return reject(err);
      }
      logger.info(`File name changed to ${newFilePath}`);
      resolve(newFilePath);
    });
  });
};

const splitVideo = async (filePath, parts = 10) => {
  return new Promise((resolve, reject) => {
    // Get the video duration first
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        logger.error(`Failed to get video metadata: ${err.message}`);
        return reject(err);
      }

      const duration = metadata.format.duration;
      const segmentDuration = duration / parts;

      const segmentPromises = [];

      for (let i = 0; i < parts; i++) {
        const start = i * segmentDuration;
        const outputFilePath = filePath.replace(
          path.extname(filePath),
          `_part${i + 1}${path.extname(filePath)}`
        );

        segmentPromises.push(
          new Promise((resolve, reject) => {
            ffmpeg(filePath)
              .setStartTime(start)
              .setDuration(segmentDuration)
              .output(outputFilePath)
              .on("end", () => {
                logger.info(`Segment ${i + 1} created at ${outputFilePath}`);
                resolve(outputFilePath);
              })
              .on("error", (err) => {
                logger.error(
                  `Failed to create segment ${i + 1}: ${err.message}`
                );
                reject(err);
              })
              .run();
          })
        );
      }

      // Wait for all segments to be created
      Promise.all(segmentPromises)
        .then((outputFiles) => resolve(outputFiles))
        .catch(reject);
    });
  });
};

const checkFileSuccess = async (filePath) => {
  logger.info(`Checking file ${filePath} for success...`);
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;

    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        logger.error(`Failed to read directory ${dirPath}: ${err.message}`);
        return reject(err);
      }
      for (const file of files) {
        const existingBaseName = path.parse(file).name;
        logger.info(`Existing Base Name: ${existingBaseName}`);
        if (existingBaseName !== baseName) {
          const existingFilePath = path.join(dirPath, file);
          try {
            await deleteFile(existingFilePath);
          } catch (unlinkErr) {
            return reject(unlinkErr);
          }
        }
      }
    });
    resolve(true);
  });
};

const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Failed to delete file ${filePath}: ${err.message}`);
        return reject(err); // Reject the promise with the error
      }
      logger.info(`Deleted file ${filePath} successfully`);
      resolve(); // Resolve the promise on success
    });
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "";
    switch (file.fieldname) {
      case "avatar":
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb("Error: Invalid user ID");
        }
        dir = path.join(`assets/images/users/${userId}`);
        break;
      case "categoryImg":
        const { categoryId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          logger.error(`Invalid category ID: ${categoryId}`);
          return cb("Error: Invalid category ID");
        }
        dir = path.join(`assets/images/categories/${categoryId}`);
        break;
      case "video":
        const userIdFromToken = req.userId;
        dir = path.join(`assets/videos/${userIdFromToken}`);
        break;
      case "videoThumbnail":
        const { videoId } = req.params;
        dir = path.join(
          `assets/videos/${videoId}/${
            file.fieldname === "video" ? "source" : "thumbnail"
          }`
        );
        break;
      case "streamThumbnail":
        const { streamId } = req.params;
        dir = path.join(`assets/images/streams/${streamId}`);
        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(`Error: Unknown field name '${file.fieldname}'`);
    }

    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to create directory ${dir}: ${err.message}`);
        return cb(err);
      }
      cb(null, dir);
    });
  },
  filename: async (req, file, cb) => {
    let baseName = req.headers["content-length"] + "_" + Date.now(); // the file is nane by the size of the file
    const ext = path.extname(file.originalname);
    let fileName = "";
    let dirPath = "";

    switch (file.fieldname) {
      case "avatar":
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb("Error: Invalid user ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/users/${userId}`);
        break;

      case "categoryImg":
        const { categoryId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          logger.error(`Invalid category ID: ${categoryId}`);
          return cb("Error: Invalid category ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/categories/${categoryId}`);
        break;
      case "video":
        const userIdFromToken = req.userId;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/videos/${userIdFromToken}`);
      case "videoThumbnail":
        const { videoId } = req.params;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(
          `assets/videos/${videoId}/${
            file.fieldname === "video" ? "source" : "thumbnail"
          }`
        );
        break;
      case "streamThumbnail":
        const { streamId } = req.params;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/streams/${streamId}`);
        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(`Error: Unknown field name '${file.fieldname}'`);
    }
    logger.info(`Saving file ${fileName} successfully to ${dirPath}`);
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  let allowedTypes = /jpeg|jpg|png|gif/;
  if (file.fieldname === "video") {
    allowedTypes = /mp4|avi|flv|wmv/;
  }
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    return cb(null, true);
  }
  logger.error("Error: Images Only!");
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|flv|wmv/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    return cb(null, true);
  }
  logger.error("Error: Videos Only!");
};

const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = {
  uploadFile,
  deleteFile,
  checkFileSuccess,
  splitVideo,
  changeFileName,
  convertMp4ToTsSegments,
  convertTsSegmentsToM3u8,
  removeExtension,
  removeFileName,
  replaceTsSegmentLinksInM3u8,
  extractFilenameFromUrl,
  extractFilenameFromPath,
  convertMp4ToHls,
};
