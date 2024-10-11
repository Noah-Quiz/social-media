const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

// Hàm kiểm tra loại tệp tin
const fileFilter = (req, file, cb) => {
  // Kiểm tra file video .mp4
  if (file.fieldname === "videoUrl") {
    const filetypes = /\.(mp4|mov|avi|mkv|wmv|flv)$/i;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only accept video format mp4, mov, avi, mkv, wmv, or flv"));
    }
  }

  // Kiểm tra file hình ảnh
  else if (file.fieldname === "thumbNailUrl") {
    const filetypes = /\.(svg|jpg|jpeg|png)$/i;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only accept file format svg, jpg, jpeg, or png"));
    }
  }

  // Nếu không phải video hoặc ảnh
  else {
    return cb(new Error("Invalid file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500000000 },
});

module.exports = upload;
