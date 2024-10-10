const { default: mongoose } = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

const createAPlaylistService = async (userId, playlistName) => {
  try {
    const connection = new DatabaseTransaction();

    const data = {
      userId,
      playlistName,
    };

    const playlist =
      await connection.myPlaylistRepository.createAPlaylistRepository(
        data,
        null
      );

    return playlist;
  } catch (error) {
    throw new Error(error);
  }
};

const getAPlaylistService = async (playlistId) => {
  try {
    const connection = new DatabaseTransaction();

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);

    return playlist;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllMyPlaylistsService = async (data) => {
  try {
    const connection = new DatabaseTransaction();

    const playlist =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository(data);

    return playlist;
  } catch (error) {
    throw new Error(error);
  }
};

const updatePlaylistService = async (userId, playlistId, updateData) => {
  try {
    const { addedVideoIds, removedVideoIds } = updateData;

    const connection = new DatabaseTransaction();
    const playlists =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository({
        userId,
      });
    const playlist = playlists.find((playlist) => playlist._id == playlistId);
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "Playlist not belong to you"
      );
    }
    const updatedPlaylist =
      await connection.myPlaylistRepository.updatePlaylistRepository(
        playlistId,
        updateData
      );

    if (!updatedPlaylist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    return updatedPlaylist;
  } catch (error) {
    throw error;
  }
};

const deletePlaylistService = async (userId, playlistId) => {
  try {
    const connection = new DatabaseTransaction();
    const user = await connection.userRepository.findUserById(userId);
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    const userPlaylists =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository({
        userId,
      });
    const checkPlaylist = userPlaylists.find(
      (playlist) => playlist._id == playlistId
    );
    if (!checkPlaylist)
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    const playlist =
      await connection.myPlaylistRepository.deletePlaylistRepository(
        playlistId
      );
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Delete playlist failed"
      );
    }

    return playlist;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAPlaylistService,
  getAPlaylistService,
  deletePlaylistService,
  getAllMyPlaylistsService,
  updatePlaylistService,
};
