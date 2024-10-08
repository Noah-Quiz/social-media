const { createVideoService } = require("../services/VideoService");
const { uploadVideo, setThumbnail, uploadFiles } = require("../middlewares/LoadFile");
const createAccessToken = require("../utils/createAccessToken");
require("dotenv").config();

class VideoController {
  async createVideoControll(req, res) {
    const { title, description, enumMode, categoryIds } = req.body;
    const userId = req.userId;

    try {
        if (!req.files.videoUrl || !req.files.thumbNailUrl) {
            return res.status(400).json({ message: "Video and thumbnail files are required." });
        }

        const videoFile = req.files.videoUrl[0];
        const thumbNailFile = req.files.thumbNailUrl[0];

        const { videoUrl, imgUrl } = await uploadFiles(videoFile, thumbNailFile);

        // Kiểm tra xem videoUrl và imgUrl có hợp lệ không
        if (!videoUrl || !imgUrl) {
          return res.status(500).json({ message: "Failed to upload video or thumbnail." });
        }

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
