const { default: mongoose } = require("mongoose");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const { createStreamService, deleteStreamService, getStreamService, endStreamService, getStreamsService, updateStreamService } = require("../services/StreamService");
const { deleteFile, checkFileSuccess } = require("../utils/stores/storeImage");

class StreamController {
  async getStreamController(req, res) {
    const { streamId } = req.params;

    try {
      const stream = await getStreamService(streamId);

      return res.status(StatusCodeEnums.OK_200).json({ stream, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async getStreamsController(req, res) {
    const query = req.query;

    if (!query.page) query.page = 1;
    if (!query.size) query.size = 10;

    try {
      if (query.page < 1) {
        return res.status(StatusCodeEnums.BadRequest_400).json({ message: "Page cannot be less than 1" })
      }
      if (query.title) {
        query.title = { $regex: query.title, $options: "i" };
      }

      const { streams, total, page, totalPages } = await getStreamsService(query);

      return res.status(StatusCodeEnums.OK_200).json({ streams, total, page, totalPages, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async endStreamController(req, res) {
    const { streamId } = req.params;

    try {
      const stream = await endStreamService(streamId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async updateStreamController(req, res) {
    const { streamId } = req.params;
    const { title, description, addedCategoryIds, removedCategoryIds } = req.body;
    let thumbnailFile = req.file ? req.file.path : null;
    const userId = req.userId;

    try {
      if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({ message: "Valid stream ID is required" });
      }

      if (addedCategoryIds && !Array.isArray(addedCategoryIds)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400, 'addedCategoryIds must be an array');
      }
      if (addedCategoryIds && addedCategoryIds.length !== 0) {
        addedCategoryIds.forEach(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CoreException(StatusCodeEnums.BadRequest_400, `Invalid category ID`);
          }
        })
      }

      if (removedCategoryIds && !Array.isArray(removedCategoryIds)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400, 'removedCategoryIds must be an array');
      }
      if (removedCategoryIds && removedCategoryIds.length !== 0) {
        removedCategoryIds.forEach(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CoreException(StatusCodeEnums.BadRequest_400, `Invalid category ID`);
          }
        })
      }

      const categoryData = { addedCategoryIds, removedCategoryIds }
      const updateData = { title, description, thumbnailUrl: thumbnailFile };

      const stream = await updateStreamService(userId, streamId, updateData, categoryData);

      if (thumbnailFile) await checkFileSuccess(thumbnailFile);

      return res.status(StatusCodeEnums.OK_200).json({ stream, message: "Stream updated successfully" });
    } catch (error) {
      if (thumbnailFile) await deleteFile(thumbnailFile);

      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async deleteStreamController(req, res) {
    const { streamId } = req.params;
    const userId = req.userId;

    try {
      await deleteStreamService(userId, streamId);

      return res.status(StatusCodeEnums.OK_200).json({ message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }

  async createStreamController(req, res) {
    const { title, description, categoryIds } = req.body;
    const userId = req.userId;

    let thumbnailFile = req.file ? req.file.path : null;

    try {
      if (thumbnailFile) {
        throw new CoreException(StatusCodeEnums.BadRequest_400).json({ message: 'No file uploaded or file type not supported!' });
      }

      if (categoryIds && !Array.isArray(categoryIds)) {
        throw new CoreException(StatusCodeEnums.BadRequest_400, 'CategoryIds must be an array');
      }
      if (categoryIds && categoryIds.length !== 0) {
        categoryIds.forEach(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CoreException(StatusCodeEnums.BadRequest_400, `Invalid category ID`);
          }
        })
      }

      const data = { userId, title, description, categoryIds, thumbnailUrl: thumbnailFile };

      const stream = await createStreamService(data);

      if (thumbnailFile) await checkFileSuccess(thumbnailFile);

      return res.status(StatusCodeEnums.Created_201).json({ stream, message: "Success" });
    } catch (error) {
      if (thumbnailFile) await deleteFile(thumbnailFile);

      if (error instanceof CoreException) {
        return res.status(error.code).json({ message: error.message });
      } else {
        return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
      }
    }
  }
}

module.exports = StreamController;
