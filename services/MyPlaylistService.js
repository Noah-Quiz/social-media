const { default: mongoose } = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const { promises } = require("nodemailer/lib/xoauth2");
const { validLength } = require("../utils/validator");

const createAPlaylistService = async (
  userId,
  playlistName,
  description,
  thumbnail,
  enumMode
) => {
  try {
    const connection = new DatabaseTransaction();
    const videoIds = [];
    const data = {
      userId,
      playlistName,
      description,
      thumbnail,
      videoIds,
      enumMode,
    };

    if (data.thumbnail !== null) {
      data.thumbnail = `${process.env.APP_BASE_URL}/${data.thumbnail}`;
    }
    //validate name
    validLength(2, 100, playlistName, "Name of playlist");

    //validate description
    if (description) {
      validLength(1, 1000, description, "Description of playlist");
    }

    const playlist =
      await connection.myPlaylistRepository.createAPlaylistRepository(
        data,
        null
      );

    return playlist;
  } catch (error) {
    throw error;
  }
};

const getAPlaylistService = async (playlistId, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    let requester = null;
    if (requesterId) {
      requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Requester not found"
        );
      }
    }

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);

    if (
      (playlist.enumMode === "private" || playlist.enumMode === "unlisted") &&
      requesterId?.toString() !== playlist?.user?._id?.toString() &&
      requester?.role !== UserEnum.ADMIN
    ) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    return playlist;
  } catch (error) {
    throw error;
  }
};

const getAllMyPlaylistsService = async (userId, requesterId, query) => {
  try {
    const connection = new DatabaseTransaction();

    let requester = null;
    if (requesterId) {
      requester = await connection.userRepository.getAnUserByIdRepository(
        requesterId
      );
      if (!requester) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Requester not found"
        );
      }
    }
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    if (
      (query.enumMode === "private" || query.enumMode === "unlisted") &&
      userId?.toString() !== requesterId?.toString() &&
      requester?.role !== UserEnum.ADMIN
    ) {
      query.enumMode = "public";
    }

    if (
      !query.enumMode &&
      userId?.toString() !== requesterId?.toString() &&
      requester?.role !== UserEnum.ADMIN
    ) {
      query.enumMode = "public";
    }

    const { playlists, total, page, totalPages } =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository(
        userId,
        query
      );
    return { playlists, total, page, totalPages };
  } catch (error) {
    throw error;
  }
};

const updatePlaylistService = async (data) => {
  const connection = new DatabaseTransaction();
  let session;

  try {
    // Start a session for the transaction
    session = await connection.startTransaction();

    const {
      userId,
      playlistId,
      playlistName,
      description,
      thumbnail,
      enumMode,
    } = data;

    //validate name
    validLength(2, 100, playlistName, "Name of playlist");

    //validate description
    if (description) {
      validLength(1, 1000, description, "Description of playlist");
    }
    // Check if user exists
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    if (!user) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");
    }

    // Check if playlist exists
    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    if (
      user?._id.toString() !== playlist.user?._id?.toString() &&
      user.role !== UserEnum.ADMIN
    ) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "You do not have permission to perform this action"
      );
    }

    // Prepare updated data
    const updatedData = {
      ...(playlistName && { playlistName }),
      ...(description && { description }),
      ...(thumbnail && { thumbnail }),
      ...(enumMode && { enumMode }),
    };

    // Update the playlist
    const updatedPlaylist =
      await connection.myPlaylistRepository.updatePlaylistRepository(
        playlistId,
        updatedData,
        session
      );

    if (!updatedPlaylist) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Update playlist failed"
      );
    }

    // Commit the transaction if everything succeeds
    await session.commitTransaction();
    return updatedPlaylist;
  } catch (error) {
    // Rollback transaction in case of error
    if (session) await session.abortTransaction();
    throw error;
  } finally {
    if (session) session.endSession();
  }
};

const deletePlaylistService = async (userId, playlistId) => {
  try {
    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserById(userId);
    if (!user)
      throw new CoreException(StatusCodeEnums.NotFound_404, "User not found");

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    const userPlaylists =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository(userId);

    if (user.role === UserEnum.USER) {
      const checkPlaylist = userPlaylists.find(
        (playlist) => playlist._id == playlistId
      );
      if (!checkPlaylist)
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "Playlist not found"
        );
    }

    const deletedPlaylist =
      await connection.myPlaylistRepository.deletePlaylistRepository(
        playlistId
      );
    if (!deletedPlaylist) {
      throw new CoreException(
        StatusCodeEnums.BadRequest_400,
        "Delete playlist failed"
      );
    }

    return deletedPlaylist;
  } catch (error) {
    throw error;
  }
};
const addToPlaylistService = async (playlistId, videoId, userId) => {
  try {
    const connection = new DatabaseTransaction();

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);

    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }
    
    if (playlist.user?._id?.toString() !== userId?.toString()) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }
    
    if (video.user?._id?.toString() !== userId?.toString() && video.enumMode === "draft") {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }
    if (video.user?._id?.toString() === userId?.toString() && video.enumMode === "draft") {
      throw new CoreException(StatusCodeEnums.Forbidden_403, "Draft video cannot be added to playlist");
    }

    if (
      playlist.videoIds?.some((id) => id.toString() === video._id.toString())
    ) {
      throw new CoreException(
        StatusCodeEnums.Conflict_409,
        "Video is already in playlist"
      );
    }

    const addedPlaylist =
      await connection.myPlaylistRepository.addToPlaylistRepository(
        playlistId,
        videoId
      );

    return addedPlaylist;
  } catch (error) {
    throw error;
  }
};

const removeFromPlaylist = async (playlistId, videoId, userId) => {
  try {
    const connection = new DatabaseTransaction();

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    const video = await connection.videoRepository.getVideoRepository(videoId);
    if (!video) {
      throw new CoreException(StatusCodeEnums.NotFound_404, "Video not found");
    }

    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );

    const notPlaylistOwner =
      playlist.user?._id?.toString() !== userId?.toString();

    const notAdmin = user.role !== UserEnum.ADMIN;
    if (notPlaylistOwner && notAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You do not have permission to perform this action"
      );
    }

    if (
      !playlist.videoIds?.some((id) => id.toString() === video._id.toString())
    ) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Video not found in playlist"
      );
    }

    const newPlaylist = connection.myPlaylistRepository.removeFromPlaylist(
      playlistId,
      videoId
    );

    return newPlaylist;
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
  addToPlaylistService,
  removeFromPlaylist,
};
