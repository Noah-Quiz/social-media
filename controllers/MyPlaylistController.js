const CreatePlaylistDto = require("../dtos/MyPlaylist/CreatePlaylistDto");
const DeletePlaylistDto = require("../dtos/MyPlaylist/DeletePlaylistDto");
const UpdatePlaylistDto = require("../dtos/MyPlaylist/UpdatePlaylistDto");
const addToPlaylistDto = require("../dtos/MyPlaylist/AddToPlaylistDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  createAPlaylistService,
  getAPlaylistService,
  deletePlaylistService,
  getAllMyPlaylistsService,
  updatePlaylistService,
  addToPlaylistService,
  removeFromPlaylist,
} = require("../services/MyPlaylistService");
const GetPlaylistByUserIdDto = require("../dtos/MyPlaylist/GetPlaylistByUserIdDto");
const GetPlaylistByIdDto = require("../dtos/MyPlaylist/GetPlaylistByIdDto");

class MyPlaylistController {
  // get a playlist
  async getAPlaylistController(req, res, next) {
    const { playlistId } = req.params;
    const requesterId = req.requesterId;
    
    try {
      const getPlaylistByIdDto = new GetPlaylistByIdDto(
        playlistId,
        requesterId
      );
      await getPlaylistByIdDto.validate();

      const playlist = await getAPlaylistService(playlistId, requesterId);

      res.status(StatusCodeEnums.OK_200).json({ playlist, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // get all playlists
  async getAllMyPlaylistsController(req, res, next) {
    try {
      const { userId } = req.params;
      const query = {
        page: req.query.page,
        size: req.query.size,
        enumMode: req.query.enumMode?.toLowerCase(),
        name: req.query.name,
      }
      const requesterId = req.requesterId;

      const getPlaylistByUserIdDto = new GetPlaylistByUserIdDto(
        requesterId,
        query.enumMode,
        query.page,
        query.size,
        query.name,
      );
      const validatedQuery = await getPlaylistByUserIdDto.validate();

      const { playlists, total, page, totalPages } = await getAllMyPlaylistsService(
        userId,
        requesterId,
        validatedQuery
      );

      res
        .status(StatusCodeEnums.OK_200)
        .json({ playlists, total, page, totalPages, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  //update playlist
  async updatePlaylistController(req, res, next) {
    try {
      const { playlistName, description, enumMode } = req.body;
      const { playlistId } = req.params;
      const userId = req.userId;

      const thumbnail = req.file ? req.file.path : null;

      const updatePlaylistDto = new UpdatePlaylistDto(
        userId,
        playlistId,
        playlistName,
        description,
        thumbnail,
        enumMode
      );
      await updatePlaylistDto.validate();

      const data = {
        userId,
        playlistId,
        playlistName,
        description,
        thumbnail,
        enumMode,
      };

      const updatedPlaylist = await updatePlaylistService(data);

      res
        .status(StatusCodeEnums.OK_200)
        .json({ playlist: updatedPlaylist, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  // delete a playlist
  async deletePlaylist(req, res, next) {
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
      next(error);
    }
  }

  async createAPlaylist(req, res, next) {
    try {
      const { playlistName, description, enumMode } = req.body;
      const userId = req.userId;

      // Check if a thumbnail file is provided
      const thumbnail = req.file ? req.file.path : null;

      const createPlaylistDto = new CreatePlaylistDto(
        userId,
        playlistName,
        enumMode,
        description,
        thumbnail
      );
      await createPlaylistDto.validate();

      const playlist = await createAPlaylistService(
        userId,
        playlistName,
        description,
        thumbnail,
        enumMode
      );

      res.status(StatusCodeEnums.OK_200).json({ playlist, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async addToPlaylistController(req, res, next) {
    try {
      const { playlistId } = req.params;
      const { videoId } = req.body;
      const userId = req.userId;
      const addToPlaylist = new addToPlaylistDto(playlistId, videoId, userId);
      await addToPlaylist.validate();
      const response = await addToPlaylistService(playlistId, videoId, userId);
      if (response) {
        res
          .status(StatusCodeEnums.OK_200)
          .json({ message: "Video added to playlist successfully" });
      }
    } catch (error) {
      next(error);
    }
  }

  async removeFromPlaylist(req, res, next) {
    try {
      const { playlistId } = req.params;
      const { videoId } = req.body;
      const userId = req.userId;
      //both have the same field => same validator
      const addToPlaylist = new addToPlaylistDto(playlistId, videoId, userId);
      await addToPlaylist.validate();
      const response = await removeFromPlaylist(playlistId, videoId, userId);
      if (response) {
        res
          .status(StatusCodeEnums.OK_200)
          .json({ message: "Video removed from playlist successfully" });
      }
    } catch (error) {
      next(error);
    }
  }
}
module.exports = MyPlaylistController;
