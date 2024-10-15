const CreatePlaylistDto = require("../dtos/MyPlaylist/CreatePlaylistDto");
const DeletePlaylistDto = require("../dtos/MyPlaylist/DeletePlaylistDto");
const UpdatePlaylistDto = require("../dtos/MyPlaylist/UpdatePlaylistDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createAPlaylistService,
  getAPlaylistService,
  deletePlaylistService,
  getAllMyPlaylistsService,
  updatePlaylistService,
} = require("../services/MyPlaylistService");

class MyPlaylistController {
  // get a playlist
  async getAPlaylistController(req, res) {
    const { playlistId } = req.params;

    try {
      const playlist = await getAPlaylistService(playlistId);

      res.status(200).json({ playlist, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // get all playlists
  async getAllMyPlaylistsController(req, res) {
    try {
      const query = {};
      const userId = req.userId;

      const data = { query, userId };

      const playlists = await getAllMyPlaylistsService(data);

      res.status(200).json({ playlists, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //update playlist
  async updatePlaylistController(req, res) {
    try {
      const { addedVideoIds, removedVideoIds, playlistName } = req.body;
      const { playlistId } = req.params;
      const userId = req.userId;
      const updatePlaylistDto = new UpdatePlaylistDto(
        addedVideoIds,
        removedVideoIds,
        playlistName,
        playlistId
      );
      await updatePlaylistDto.validate();

      const data = {
        addedVideoIds,
        removedVideoIds,
        playlistName,
      };

      const updatedPlaylist = await updatePlaylistService(
        userId,
        playlistId,
        data
      );

      res
        .status(StatusCodeEnums.OK_200)
        .json({ playlist: updatedPlaylist, message: "Success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  // delete a playlist
  async deletePlaylist(req, res) {
    try {
      const { playlistId } = req.params;
      const deletePlaylistDto = new DeletePlaylistDto(playlistId);
      await deletePlaylistDto.validate();

      const userId = req.userId;

      await deletePlaylistService(userId, playlistId);

      res
        .status(StatusCodeEnums.OK_200)
        .json({ message: "Delete playlist success" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async createAPlaylist(req, res) {
    try {
      const { playlistName } = req.body;
      const userId = req.userId;
      const createPlaylistDto = new CreatePlaylistDto(userId, playlistName);
      await createPlaylistDto.validate();

      const playlist = await createAPlaylistService(userId, playlistName);

      res.status(200).json({ playlist, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = MyPlaylistController;
