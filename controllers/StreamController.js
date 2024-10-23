const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createStreamService,
  deleteStreamService,
  getStreamService,
  endStreamService,
  getStreamsService,
  updateStreamService,
  resetStreamKeyService,
  deleteLiveStreamByUidService,
  toggleLikeStreamService,
} = require("../services/StreamService");
const { deleteFile, checkFileSuccess } = require("../utils/stores/storeImage");
const { createMuxToken } = require("../utils/muxLiveStream");
const {
  createCloudFlareStreamLiveInput,
  listCloudFlareStreamLiveInputs,
  deleteCloudFlareStreamLiveInput,
} = require("../services/CloudFlareStreamService");
const { sendMessageToQueue } = require("../utils/rabbitMq");
const CreateStreamDto = require("../dtos/Stream/CreateStreamDto");
const DeleteStreamDto = require("../dtos/Stream/DeleteStreamDto");
const UpdateStreamDto = require("../dtos/Stream/UpdateStreamDto");

class StreamController {
  async listLiveInputsController(req, res) {
    try {
      const lives = await listCloudFlareStreamLiveInputs();
      console.log(lives);
      return res
        .status(StatusCodeEnums.OK_200)
        .json({ lives, message: "Success" });
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

  // async createLiveInputController(req, res) {
  //   try {
  //     const { streamName, description } = req.body;
  //     const creatorId = req.userId;

  //     const cloudflareStream = await createCloudFlareStreamLiveInput(
  //       creatorId,
  //       streamName
  //     );

  //     console.log(cloudflareStream);
  //     await createStreamService({
  //       userId: creatorId,
  //       title: streamName,
  //       description,
  //       uid: cloudflareStream.uid,
  //       rtmps: cloudflareStream.rtmps,
  //       rtmpsPlayback: cloudflareStream.rtmpsPlayback,
  //       srt: cloudflareStream.srt,
  //       srtPlayback: cloudflareStream.srtPlayback,
  //       webRTC: cloudflareStream.webRTC,
  //       webRTCPlayback: cloudflareStream.webRTCPlayback,
  //       status: cloudflareStream.status,
  //       meta: cloudflareStream.meta,
  //     });

  //     return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
  //   } catch (error) {
  //     if (error instanceof CoreException) {
  //       return res.status(error.code).json({ message: error.message });
  //     } else {
  //       return res
  //         .status(StatusCodeEnums.InternalServerError_500)
  //         .json({ message: error.message });
  //     }
  //   }
  // }

  async updateLiveInputController(req, res) {
    try {
      const { streamId } = req.params;
      const { creatorId, streamName } = req.body;
    } catch (error) {}
  }

  // async deleteLiveInputController(req, res) {
  //   try {
  //     const { streamId } = req.params;
  //     const userId = req.userId;
  //     await deleteStreamService(userId, streamId);
  //     return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
  //   } catch (error) {
  //     if (error instanceof CoreException) {
  //       return res.status(error.code).json({ message: error.message });
  //     } else {
  //       return res
  //         .status(StatusCodeEnums.InternalServerError_500)
  //         .json({ message: error.message });
  //     }
  //   }
  // }

  async getStreamController(req, res) {
    const { streamId } = req.params;

    try {
      if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({
          message: "Valid stream ID is required",
        });
      }

      const stream = await getStreamService(streamId);

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
        query
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

  async endStreamController(req, res) {
    const { streamId } = req.params;

    try {
      if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({
          message: "Valid stream ID is required",
        });
      }

      const stream = await getStreamService(streamId);

      sendMessageToQueue("bunny_livestream", {
        data: { input_id: stream.uid },
      });

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
      if (thumbnailFile) await deleteFile(thumbnailFile);

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
      let thumbnailFile = req.file ? req.file.path : null;
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
      const cloudflareStream = await createCloudFlareStreamLiveInput(
        creatorId,
        streamName
      );

      // Prepare stream data with live input details
      const streamData = {
        userId,
        title,
        description,
        categoryIds,
        thumbnailUrl: thumbnailFile,
        uid: cloudflareStream.uid,
        rtmps: cloudflareStream.rtmps,
        rtmpsPlayback: cloudflareStream.rtmpsPlayback,
        srt: cloudflareStream.srt,
        srtPlayback: cloudflareStream.srtPlayback,
        webRTC: cloudflareStream.webRTC,
        webRTCPlayback: cloudflareStream.webRTCPlayback,
        status: cloudflareStream.status,
        meta: cloudflareStream.meta,
      };

      // Create stream entry in the database
      const stream = await createStreamService(streamData);

      // Check if thumbnail upload was successful
      if (thumbnailFile) await checkFileSuccess(thumbnailFile);

      return res
        .status(StatusCodeEnums.Created_201)
        .json({ stream, message: "Live Stream created successfully" });
    } catch (error) {
      // Delete thumbnail if an error occurs
      if (thumbnailFile) await deleteFile(thumbnailFile);

      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
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
}

module.exports = StreamController;
