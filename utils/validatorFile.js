const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

// Hàm kiểm tra loại tệp tin
const fileFilter = (req, file, cb) => {
  // Kiểm tra file video .mp4
  if (file.fieldname === 'videoUrl') { 
    const filetypes = /\.(mp4)$/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log('videoUrl - extname:', path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file video định dạng mp4'));
    }
  } 
  // Kiểm tra file hình ảnh
  else if (file.fieldname === 'thumbNailUrl') { 
    const filetypes = /\.(svg|jpg|jpeg|png)$/i;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log('thumbNailUrl - extname:', path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh svg, jpg, jpeg, hoặc png'));
    }
  } 
  // Nếu không phải video hoặc ảnh
  else {
    return cb(new Error('Loại tệp không được chấp nhận'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500000000 } // Giới hạn kích thước file 500MB
});

module.exports = upload;
