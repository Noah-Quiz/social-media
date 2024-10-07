const { createVideoService } = require("../services/VideoService");
const { uploadFiles } = require("../middlewares/LoadFile");
const createAccessToken = require("../utils/createAccessToken");
require("dotenv").config();

class VideoController {
  async createVideoControll(req, res) {
    const { title, description, enumMode, categoryIds } = req.body;
    const userId = req.userId;

    try {
        // Kiểm tra xem file video và thumbnail có được gửi lên không
        if (!req.files.videoUrl || !req.files.thumbNailUrl) {
            return res.status(400).json({ message: "Video and thumbnail files are required." });
        }

        // Lấy file video và thumbnail từ req.files
        const videoFile = req.files.videoUrl[0];
        const thumbNailFile = req.files.thumbNailUrl[0];

        // Gọi hàm uploadFiles để tải video và thumbnail lên Vimeo
        const { videoUrl, imgUrl } = await uploadFiles(videoFile, thumbNailFile);

        // Gọi hàm createVideoService để lưu thông tin video vào cơ sở dữ liệu
        const video = await createVideoService(userId, {
            title,
            description,
            videoUrl,
            enumMode,
            thumbNailUrl: imgUrl,
            categoryIds,
        });

        res.status(201).json({ message: "Create Video successfully", video });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = VideoController;
