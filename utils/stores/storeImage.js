const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require('util');
const getLogger = require("../logger");
const logger = getLogger("IMAGE_UPLOAD");

const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);

// Delete File Function
const deleteFile = async (filePath) => {
  try {
    await unlink(filePath);
    logger.info(`Deleted file ${filePath} successfully`);
  } catch (err) {
    logger.error(`Failed to delete file ${filePath}: ${err.message}`);
    throw err;
  }
};

// Check File Success Function
const checkFileSuccess = async (filePath) => {
  logger.info(`Checking file ${filePath} for success...`);
  try {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;
    const files = await readdir(dirPath);

    for (const file of files) {
      const existingBaseName = path.parse(file).name;
      logger.info(`Existing Base Name: ${existingBaseName}`);
      if (existingBaseName !== baseName) {
        const existingFilePath = path.join(dirPath, file);
        await deleteFile(existingFilePath);
      }
    }
    return true;
  } catch (err) {
    logger.error(`Error in checkFileSuccess: ${err.message}`);
    throw err;
  }
};

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "";
    switch (file.fieldname) {
      case "avatar": {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb("Error: Invalid user ID");
        }
        dir = path.join(`assets/images/users/${userId}`);
        break;
      }
      case "categoryImg": {
        const { categoryId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          logger.error(`Invalid category ID: ${categoryId}`);
          return cb("Error: Invalid category ID");
        }
        dir = path.join(`assets/images/categories/${categoryId}`);
        break;
      }
      case "thumbnailImg":
        dir = path.join(`assets/images/stream-thumbnail`);
        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(`Error: Unknown field name '${file.fieldname}'`);
    }

    mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch((err) => {
        logger.error(`Failed to create directory ${dir}: ${err.message}`);
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    (async () => {
      try {
        const baseName = req.headers["content-length"] + "_" + Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        let fileName = "";
        let dirPath = "";

        switch (file.fieldname) {
          case "avatar": {
            const { userId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
              logger.error(`Invalid user ID: ${userId}`);
              return cb("Error: Invalid user ID");
            }
            fileName = `${baseName}${ext}`;
            dirPath = path.join(`assets/images/users/${userId}`);
            break;
          }
          case "categoryImg": {
            const { categoryId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
              logger.error(`Invalid category ID: ${categoryId}`);
              return cb("Error: Invalid category ID");
            }
            fileName = `${baseName}${ext}`;
            dirPath = path.join(`assets/images/categories/${categoryId}`);
            break;
          }
          case "thumbnailImg":
            fileName = `${baseName}${ext}`;
            dirPath = path.join(`assets/images/stream-thumbnail`);
            break;
          default:
            logger.error(`Unknown field name: ${file.fieldname}`);
            return cb(`Error: Unknown field name '${file.fieldname}'`);
        }

        // Delete existing files with the same base name
        const files = await readdir(dirPath);
        for (const existingFile of files) {
          const existingBaseName = path.parse(existingFile).name.split('_')[0];
          const currentBaseName = baseName.split('_')[0];
          if (existingBaseName === currentBaseName) {
            const existingFilePath = path.join(dirPath, existingFile);
            await deleteFile(existingFilePath);
          }
        }

        logger.info(`Saving file ${fileName} successfully to ${dirPath}`);
        cb(null, fileName);
      } catch (err) {
        logger.error(`Error in filename function: ${err.message}`);
        cb(err);
      }
    })();
  },
});

// File Filter Configuration
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (mimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    logger.error("Error: Only image files (jpeg, jpg, png, gif) are allowed!");
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"), false);
  }
};

// Multer Upload Configuration
const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // Limit size to 25MB
});

module.exports = { uploadImage, deleteFile, checkFileSuccess };
