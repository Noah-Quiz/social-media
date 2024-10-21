const { default: mongoose } = require("mongoose");
const MyPlaylist = require("../entities/MyPlaylistEntity");

class MyPlaylistRepository {
  // Create a new playlist
  async createAPlaylistRepository(data, session) {
    try {
      const playlist = await MyPlaylist.create([data], { session });
      return playlist[0];
    } catch (error) {
      throw new Error(`Error creating playlist: ${error.message}`);
    }
  }

  // Get a playlist by ID with videos and user info for each video
  async getAPlaylistRepository(playlistId) {
    try {
      const playlist = await MyPlaylist.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(playlistId),

            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$user", // Ensure that we get only one user for the playlist creator
        },
        {
          $project: {
            _id: 1,
            playlistName: 1,
            userId: 1,
            isDeleted: 1,
            dateCreated: 1,
            lastUpdated: 1,
            "user.fullName": 1,
            "user.nickName": 1,
            "user.avatar": 1,
          },
        },
      ]);

      if (!playlist[0]) {
        throw new Error("Playlist not found");
      }

      if (playlist[0]) {
        return { ...playlist[0] };
      }
    } catch (error) {
      throw new Error(`Error finding playlist: ${error.message}`);
    }
  }

  // Update a playlist
  async updatePlaylistRepository(playlistId, updateData) {
    try {
      const playlist = await MyPlaylist.findById(playlistId);

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      if (updateData.addedVideoIds && updateData.addedVideoIds.length > 0) {
        await MyPlaylist.updateOne(
          { _id: playlistId },
          { $addToSet: { videoIds: { $each: updateData.addedVideoIds } } },
          { runValidators: true }
        );
      }

      if (updateData.removedVideoIds && updateData.removedVideoIds.length > 0) {
        await MyPlaylist.updateOne(
          { _id: playlistId },
          { $pull: { videoIds: { $in: updateData.removedVideoIds } } },
          { runValidators: true }
        );
      }

      const updatedPlaylist = await MyPlaylist.findByIdAndUpdate(
        playlistId,
        { playlistName: updateData.playlistName },
        { new: true, runValidators: true }
      );

      return updatedPlaylist;
    } catch (error) {
      throw new Error(`Error updating playlist: ${error.message}`);
    }
  }

  // Delete a playlist by ID
  async deletePlaylistRepository(playlistId, session) {
    try {
      const playlist = await MyPlaylist.findByIdAndUpdate(
        playlistId,
        { isDeleted: true },
        { new: true, runValidators: true, session }
      );

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      return playlist;
    } catch (error) {
      throw new Error(`Error deleting playlist: ${error.message}`);
    }
  }

  // Get all user's own playlists
  async getAllMyPlaylistsRepository(data) {
    try {
      const playlists = await MyPlaylist.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(data.userId),

            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$user", // Ensure that we get only one user for the playlist creator
        },
        {
          $project: {
            _id: 1,
            playlistName: 1,
            userId: 1,
            isDeleted: 1,
            dateCreated: 1,
            lastUpdated: 1,
            "user.fullName": 1,
            "user.nickName": 1,
            "user.avatar": 1,
          },
        },
      ]);

      return playlists;
    } catch (error) {
      throw new Error(`Error fetching streams: ${error.message}`);
    }
  }
}

module.exports = MyPlaylistRepository;
