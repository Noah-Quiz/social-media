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
const GetStreamsDto = require("../dtos/Stream/GetStreamsDto");

const streamServerBaseUrl = process.env.STREAM_SERVER_BASE_URL;

class StreamController {
  async getStreamController(req, res, next) {
    const { streamId } = req.params;
    const { ownerId } = req.body;

    try {
      if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({
          message: "Valid stream ID is required",
        });
      }
      if (ownerId && !mongoose.Types.ObjectId.isValid(ownerId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({
          message: "Valid owner ID is required",
        });
      }

      const stream = await getStreamService(streamId, ownerId);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ stream, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getStreamsController(req, res, next) {
    try {
      const { ownerId } = req.body;

      const query = {
        size: req.query.size || 10,
        page: req.query.page || 1,
        title: req.query.title,
        status: req.query.status,
        sortBy: req.query.sortBy,
        order: req.query.order,
      };

      const getStreamsDto = new GetStreamsDto(query.size, query.page, query.status, query.sortBy, query.order);
      await getStreamsDto.validate();

      const { streams, total, page, totalPages } = await getStreamsService(
        query,
        ownerId,
      );

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ streams, total, page, totalPages, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async updateStreamController(req, res, next) {
    const { streamId } = req.params;
    let { title, description, categoryIds } = req.body;
    let thumbnailFile = req.file ? req.file.path : null;
    const userId = req.userId;

    // Adjust incase single category
    if (typeof categoryIds === "string") {
      if (categoryIds.includes(",")) {
        categoryIds = categoryIds.split(",").map((id) => id.trim());
      } else {
        categoryIds = [categoryIds.trim()];
      }
    }

    try {
      const updateStreamDto = new UpdateStreamDto(
        streamId,
        title,
        description,
        categoryIds
      );
      await updateStreamDto.validate();

      const updateData = {
        title,
        description,
        categoryIds: categoryIds,
        thumbnailUrl: thumbnailFile,
      };

      if (updateData.categoryIds && updateData.categoryIds.length > 0) {
        updateData.categoryIds = updateData.categoryIds.filter(
          (id) => id !== ""
        );
      }

      // Filter out duplicate category IDs
      if (updateData.categoryIds && updateData.categoryIds.length > 0) {
        updateData.categoryIds = [...new Set(updateData.categoryIds)];
      }
      const stream = await updateStreamService(userId, streamId, updateData);

      if (thumbnailFile) await checkFileSuccess(thumbnailFile);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ stream, message: "Stream updated successfully" });
    } catch (error) {
      if (req.file) await deleteFile(thumbnailFile);

      next(error);
    }
  }

  async deleteStreamController(req, res, next) {
    try {
      const { streamId } = req.params;
      const userId = req.userId;
      const deleteStreamDto = new DeleteStreamDto(streamId, userId);
      await deleteStreamDto.validate();

      await deleteStreamService(userId, streamId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async createStreamController(req, res, next) {
    try {
      const { title, description, categoryIds } = req.body;
      const userId = req.userId;
      const createStreamDto = new CreateStreamDto(
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
        response = await axios.post(
          `${streamServerBaseUrl}/api/cloudflare/live-input`,
          {
            creatorId,
            streamName,
          }
        );
      } catch (error) {
        throw new CoreException(StatusCodeEnums.InternalServerError_500).json({
          message: "Failed to create live stream",
        });
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
      next(error);
    }
  }

  async toggleLikeStreamController(req, res, next) {
    const { streamId } = req.params;
    const { action } = req.query;
    const userId = req.userId;

    try {
      if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({
          message: "Valid stream ID is required",
        });
      }

      await toggleLikeStreamService(streamId, userId, action);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedStreamsController(req, res, next) {
    const userId = req.userId;
    const data = { userId };

    try {
      const streams = await getRecommendedStreamsService(data);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ streams, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getRelevantStreamsController(req, res, next) {
    const { categoryIds } = req.body;
    console.log(categoryIds)
    try {
      const streamRecommendationDto = new StreamRecommendationDto(
        categoryIds
      );
      await streamRecommendationDto.validate();

      const data = {
        categoryIds
      };

      const streams = await getRelevantStreamsService(data);

      return res
        .status(StatusCodeEnums.OK_200)
        .json({ streams, message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StreamController;
