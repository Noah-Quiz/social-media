const { default: mongoose } = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const UserEnum = require("../enums/UserEnum");
const { promises } = require("nodemailer/lib/xoauth2");

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

const getAPlaylistService = async (playlistId, requesterId) => {
  try {
    const connection = new DatabaseTransaction();

    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(
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
    console.log(requesterId);
    console.log(playlist);
    if (
      playlist.enumMode === "private" &&
      requesterId?.toString() !== playlist?.user?._id?.toString()
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

    if (requesterId) {
      const requester = await connection.userRepository.getAnUserByIdRepository(
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
      query.enumMode === "private" &&
      userId?.toString() !== requesterId?.toString()
    ) {
      query.enumMode = "public";
    }
    if (!query.enumMode && userId?.toString() !== requesterId?.toString()) {
      query.enumMode = "public";
    }

    const playlists =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository(
        userId,
        query
      );

    return playlists;
  } catch (error) {
    throw new Error(error);
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

    // Check permissions if the user is not an admin
    if (user.role === UserEnum.USER) {
      const userPlaylists =
        await connection.myPlaylistRepository.getAllMyPlaylistsRepository({
          userId,
        });
      const checkPlaylist = userPlaylists.find((p) => p._id == playlistId);
      if (!checkPlaylist) {
        throw new CoreException(
          StatusCodeEnums.Forbidden_403,
          "You do not have permission to perform this action"
        );
      }
    }

    // Prepare updated data
    const updatedData = {
      ...(playlistName && { playlistName }),
      ...(description && { description }),
      ...(thumbnail && { thumbnail }),
      ...(enumMode && { enumMode }),
      lastUpdated: Date.now(),
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

    if (user.role !== UserEnum.ADMIN && user.role !== UserEnum.USER) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You are not allowed to update playlist"
      );
    }

    const playlist =
      await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);
    if (!playlist) {
      throw new CoreException(
        StatusCodeEnums.NotFound_404,
        "Playlist not found"
      );
    }

    const userPlaylists =
      await connection.myPlaylistRepository.getAllMyPlaylistsRepository({
        userId,
      });

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
    if (playlist.userId?.toString() !== userId) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You are not the owner of this playlist"
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
    const user = await connection.userRepository.getAnUserByIdRepository(
      userId
    );
    const notPlaylistOwner = playlist.userId?.toString() !== userId?.toString();
    const notAdmin = user.role === UserEnum.ADMIN;
    if (notPlaylistOwner && notAdmin) {
      throw new CoreException(
        StatusCodeEnums.Forbidden_403,
        "You don't have access to perform this action on this playlist"
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
