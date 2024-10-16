const { default: mongoose } = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const getLogger = require("../logger");
const logger = getLogger("IMAGE_UPLOAD");

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
      case "videoThumbnail":
        const { videoId } = req.params;
        dir = path.join(`assets/videos/${videoId}`);
        break;
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
    const baseName = req.headers["content-length"] + "_" + Date.now(); // the file is nane by the size of the file
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
      case "videoThumbnail":
        const { videoId } = req.params;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/videos/${videoId}`);
        break;
      case "thumbnailImg":
        dir = path.join(`assets/images/stream-thumbnail`);
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

const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFilter,
  limits: { fileSize: 1024 * 1024 * 1024 * 2 }, //Limit size to 2GB
});

module.exports = { uploadImage, uploadVideo, deleteFile, checkFileSuccess };
