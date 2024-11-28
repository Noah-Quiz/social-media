const { default: mongoose } = require("mongoose");
const MyPlaylist = require("../entities/MyPlaylistEntity");
const Video = require("../entities/VideoEntity");

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
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            _id: 1,
            playlistName: 1,
            description: 1,
            dateCreated: 1,
            lastUpdated: 1,
            thumbnail: 1,
            enumMode: 1,
            videoIds: 1,
            videosCount: { $size: "$videoIds" },
            user: {
              _id: 1,
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
          },
        },
      ]);

      return playlist[0] || null;
    } catch (error) {
      throw new Error(`Error finding playlist: ${error.message}`);
    }
  }

  // Update a playlist
  async updatePlaylistRepository(playlistId, data, session) {
    try {
      const playlist = await MyPlaylist.findByIdAndUpdate(
        playlistId,
        { ...data, lastUpdated: Date.now() },
        { new: true, runValidators: true, session }
      );

      return playlist;
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
  async getAllMyPlaylistsRepository(userId, query = {}) {
    try {
      const page = query.page || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;

      const searchQuery = {
        isDeleted: false,
        userId: new mongoose.Types.ObjectId(userId),
      };

      if (query.name) {
        searchQuery.playlistName = { $regex: new RegExp(query.name, "i") };
      }
      if (query.enumMode) {
        searchQuery.enumMode = query.enumMode;
      }

      const totalPlaylists = await MyPlaylist.countDocuments(searchQuery);

      const playlists = await MyPlaylist.aggregate([
        {
          $match: searchQuery,
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
                  _id: 1,
                  fullName: 1,
                  nickName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            _id: 1,
            playlistName: 1,
            description: 1,
            thumbnail: 1,
            enumMode: 1,
            dateCreated: 1,
            lastUpdated: 1,
            videosCount: { $size: "$videoIds" },
            user: {
              _id: 1,
              fullName: "$user.fullName",
              nickName: "$user.nickName",
              avatar: "$user.avatar",
            },
          },
        },
        { $sort: { lastUpdated: -1 }, },
        { $skip: skip },
        { $limit: Number(size) },
      ]);

      return {
        playlists,
        total: totalPlaylists,
        page: Number(page),
        totalPages: Math.ceil(totalPlaylists / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error fetching playlist: ${error.message}`);
    }
  }

  async addToPlaylistRepository(playlistId, videoId) {
    try {
      // Use $addToSet to add videoId to videoIds array if it doesn't already exist
      const updatedPlaylist = await MyPlaylist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videoIds: videoId }, lastUpdated: Date.now() },
        { new: true }
      );

      return updatedPlaylist;
    } catch (error) {
      throw new Error(`Error adding video to playlist: ${error.message}`);
    }
  }

  async removeFromPlaylist(playlistId, videoId) {
  try {
    const playlist = await MyPlaylist.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(playlistId), isDeleted: false },
      { 
        $pull: { videoIds: videoId },
        lastUpdated: Date.now(),
      },
      { new: true }
    );

    return playlist;
  } catch (error) {
    throw new Error(`Error removing video from playlist: ${error.message}`);
  }
}

}
module.exports = MyPlaylistRepository;
