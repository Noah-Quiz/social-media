const { default: mongoose } = require("mongoose");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("assets/images"));
  },
  filename: (req, file, cb) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return cb("Error: Invalid user ID");
    }
    const ext = path.extname(file.originalname);
    cb(null, `${userId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb("Error: Images Only!");
};

const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = uploadImage;
