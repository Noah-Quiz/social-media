const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createStreamService,
  deleteStreamService,
  getStreamService,
  getStreamsService,
  updateStreamService,
  toggleLikeStreamService,
  getRecommendedStreamsService,
  getRelevantStreamsService,
} = require("../services/StreamService");
const { deleteFile, checkFileSuccess } = require("../middlewares/storeFile");
const CreateStreamDto = require("../dtos/Stream/CreateStreamDto");
const DeleteStreamDto = require("../dtos/Stream/DeleteStreamDto");
const UpdateStreamDto = require("../dtos/Stream/UpdateStreamDto");
const StreamRecommendationDto = require("../dtos/Stream/StreamRecommendationDto");
const { default: axios } = require("axios");

const streamServerBaseUrl = process.env.STREAM_SERVER_BASE_URL;

class StreamController {
  async getStreamController(req, res) {
    const { streamId } = req.params;
    const requester = req.userId;

    try {
      if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({
          message: "Valid stream ID is required",
        });
      }

      const stream = await getStreamService(streamId, requester);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ stream, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getStreamsController(req, res) {
    const query = req.query;
    const requester = req.userId;

    if (!query.page) query.page = 1;
    if (!query.size) query.size = 10;

    try {
      if (query.page < 1) {
        return res
          .status(StatusCodeEnums.BadRequest_400)
          .json({ message: "Page cannot be less than 1" });
      }
      if (query.title) {
        query.title = { $regex: query.title, $options: "i" };
      }

      const { streams, total, page, totalPages } = await getStreamsService(
        query,
        requester
      );

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ streams, total, page, totalPages, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async updateStreamController(req, res) {
    try {
      const { streamId } = req.params;
      const { title, description, addedCategoryIds, removedCategoryIds } =
        req.body;
      let thumbnailFile = req.file ? req.file.path : null;
      const userId = req.userId;
      const updateStreamDto = new UpdateStreamDto(
        streamId,
        userId,
        title,
        description,
        addedCategoryIds,
        removedCategoryIds
      );
      await updateStreamDto.validate();

      const categoryData = { addedCategoryIds, removedCategoryIds };
      const updateData = { title, description, thumbnailUrl: thumbnailFile };

      const stream = await updateStreamService(
        userId,
        streamId,
        updateData,
        categoryData
      );

      if (thumbnailFile) await checkFileSuccess(thumbnailFile);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ stream, message: "Stream updated successfully" });
    } catch (error) {
      if (req.file) await deleteFile(thumbnailFile);

      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async deleteStreamController(req, res) {
    try {
      const { streamId } = req.params;
      const userId = req.userId;
      const deleteStreamDto = new DeleteStreamDto(streamId, userId);
      await deleteStreamDto.validate();

      await deleteStreamService(userId, streamId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async createStreamController(req, res) {
    try {
      const { title, description, categoryIds } = req.body;
      const userId = req.userId;
      const createStreamDto = new CreateStreamDto(
        userId,
        title,
        description,
        categoryIds
      );
      await createStreamDto.validate();

      // Create live input using Cloudflare service
      const creatorId = userId;
      const streamName = title;

      let response = null;
      try {
        response = await axios.post(`${streamServerBaseUrl}/api/cloudflare/live-input`, {
          creatorId,
          streamName,
        });
      } catch (error) {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: "Internal Server Error. Fail to create live stream" });
      }

      const cloudflareStream = response.data?.liveInput;

      // Prepare stream data with live input details
      const streamData = {
        userId,
        title,
        description,
        categoryIds,
        uid: cloudflareStream?.uid,
        rtmps: cloudflareStream?.rtmps,
        rtmpsPlayback: cloudflareStream?.rtmpsPlayback,
        srt: cloudflareStream?.srt,
        srtPlayback: cloudflareStream?.srtPlayback,
        webRTC: cloudflareStream?.webRTC,
        webRTCPlayback: cloudflareStream?.webRTCPlayback,
        meta: cloudflareStream?.meta,
      };

      // Create stream entry in the database
      const stream = await createStreamService(streamData);

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ stream, message: "Live Stream created successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error });
      }
    }
  }

  async toggleLikeStreamController(req, res) {
    const { streamId } = req.params;
    const { action } = req.query;
    const userId = req.userId;

    if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Valid stream ID is required" });
    }

    try {
      await toggleLikeStreamService(streamId, userId, action);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getRecommendedStreamsController(req, res) {
    const userId = req.userId;
    const data = { userId };

    try {
      const streams = await getRecommendedStreamsService(data)

      return res.status(StatusCodeEnums.OK_200).json({ streams, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async getRelevantStreamsController(req, res) {
    const { streamerId, categoryIds } = req.body;
    const userId = req.userId;

    try {
      const streamRecommendationDto = new StreamRecommendationDto(streamerId, categoryIds);
      await streamRecommendationDto.validate();

      const data = {
        streamerId,
        categoryIds,
      }

      const streams = await getRelevantStreamsService(data)

      return res.status(StatusCodeEnums.OK_200).json({ streams, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
}

module.exports = StreamController;
