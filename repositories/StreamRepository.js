const { default: mongoose } = require("mongoose");
const Stream = require("../entities/StreamEntity");

class StreamRepository {
  // Create a new stream
  async createStreamRepository(data, session) {
    try {
      const stream = await Stream.create([{ ...data, lastUpdated: Date.now() }], { session });
      return stream[0];
    } catch (error) {
      throw new Error(`Error creating stream: ${error.message}`);
    }
  }

  // End a stream by setting the endedAt field
  async endStreamRepository(streamId, session) {
    try {
      const stream = await Stream.findByIdAndUpdate(
        streamId,
        {
          endedAt: Date.now(),
          lastUpdated: Date.now(),
          streamUrl: "",
        },
        { new: true, runValidators: true, session }
      );

      if (!stream) {
        throw new Error(`Stream with ID ${streamId} not found`);
      }

      return stream;
    } catch (error) {
      throw new Error(`Error ending stream: ${error.message}`);
    }
  }

  // Get a stream by ID
  async getStreamRepository(streamId) {
    try {
      const result = await Stream.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(streamId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "categories",
            localField: "categoryIds",
            foreignField: "_id",
            as: "categories",
            pipeline: [
              {
                $project: {
                  name: 1,
                  imageUrl: 1,
                  _id: 0,
                },
              },
            ],
          },
        },
        {
          $project: {
            merged: {
              $mergeObjects: [
                "$$ROOT",
                {
                  user: {
                    fullName: "$user.fullName",
                    nickName: "$user.nickName",
                    avatar: "$user.avatar",
                  },
                },
              ],
            },
          },
        },
        { $replaceRoot: { newRoot: "$merged" } },
        { $project: { categoryIds: 0 } },
      ]);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding stream: ${error.message}`);
    }
  }

  // Update a stream
  async updateStreamRepository(streamId, updateData, categoryData, session = null) {
    try {
      const updateOperations = { lastUpdated: Date.now(), ...updateData };

      if (categoryData.addedCategoryIds && categoryData.addedCategoryIds.length > 0) {
        await Stream.updateOne(
          { _id: streamId },
          { $addToSet: { categoryIds: { $each: categoryData.addedCategoryIds } }, lastUpdated: Date.now() },
          { runValidators: true, session }
        );
      }

      if (categoryData.removedCategoryIds && categoryData.removedCategoryIds.length > 0) {
        await Stream.updateOne(
          { _id: streamId },
          { $pull: { categoryIds: { $in: categoryData.removedCategoryIds } }, lastUpdated: Date.now() },
          { runValidators: true, session }
        );
      }

      const updatedStream = await Stream.findByIdAndUpdate(
        streamId,
        updateOperations,
        { new: true, runValidators: true, session }
      );

      return updatedStream;
    } catch (error) {
      throw new Error(`Error updating stream: ${error.message}`);
    }
  }

  // Delete a stream by ID
  async deleteStreamRepository(streamId, session) {
    try {
      const stream = await Stream.findByIdAndUpdate(
        streamId,
        { isDeleted: true, lastUpdated: Date.now() },
        { new: true, runValidators: true, session }
      );

      if (!stream) {
        throw new Error("Stream not found");
      }

      return stream;
    } catch (error) {
      throw new Error(`Error deleting stream: ${error.message}`);
    }
  }

  // Get all streams
  async getStreamsRepository(query) {
    try {
      const skip = (query.page - 1) * query.size;

      const searchQuery = { isDeleted: false };

      if (query.title) {
        searchQuery.name = query.title;
      }

      const totalStreams = await Stream.countDocuments(searchQuery);

      const streams = await Stream.aggregate([
        { $match: searchQuery },
        { $skip: skip },
        { $limit: +query.size },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            merged: {
              $mergeObjects: [
                "$$ROOT",
                { user: { fullName: "$user.fullName", nickName: "$user.nickName", avatar: "$user.avatar" } },
              ],
            },
          },
        },
        { $replaceRoot: { newRoot: "$merged" } },
      ]);

      return {
        streams,
        total: totalStreams,
        page: query.page,
        totalPages: Math.ceil(totalStreams / query.size),
      };
    } catch (error) {
      throw new Error(`Error getting streams: ${error.message}`);
    }
  }
}

module.exports = StreamRepository;