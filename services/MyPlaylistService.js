const { default: mongoose } = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");

const createAPlaylistService = async (userId, playlistName) => {
    try {
        const connection = new DatabaseTransaction();

        const data = {
            userId, playlistName
        }
        
        const playlist = await connection.myPlaylistRepository.createAPlaylistRepository(data, null);

        return playlist;
    } catch (error) {
        throw new Error(error)
    }
}

const getAPlaylistService = async (playlistId) => {
    try {
        const connection = new DatabaseTransaction();
        
        const playlist = await connection.myPlaylistRepository.getAPlaylistRepository(playlistId);

        return playlist;
    } catch (error) {
        throw new Error(error)
    }
}

const getAllMyPlaylistsService = async (data) => {
    try {
        const connection = new DatabaseTransaction();
        
        const playlist = await connection.myPlaylistRepository.getAllMyPlaylistsRepository(data);

        return playlist;
    } catch (error) {
        throw new Error(error)
    }
}

const updatePlaylistService = async (playlistId, updateData) => {
    const { addedVideoIds, removedVideoIds } = updateData;

    try {
        if (!Array.isArray(addedVideoIds)) {
            throw new Error('addedVideoIds must be an array');
        }
        if (!Array.isArray(removedVideoIds)) {
            throw new Error('removedVideoIds must be an array');
        }

        addedVideoIds.forEach(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid video ID: ${id}. Cannot add`);
            }
        });

        removedVideoIds.forEach(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid video ID: ${id}. Cannot remove`);
            }
        });

        const connection = new DatabaseTransaction();
        
        const updatedPlaylist = await connection.myPlaylistRepository.updatePlaylistRepository(playlistId, updateData);

        if (!updatedPlaylist) {
            throw new Error('Playlist not found');
        }

        return updatedPlaylist;
    } catch (error) {
        throw new Error(`Error updating playlist: ${error.message}`);
    }
}


const deletePlaylistService = async (playlistId) => {
    try {
        const connection = new DatabaseTransaction();
        
        const playlist = await connection.myPlaylistRepository.deletePlaylistRepository(playlistId);

        return playlist;
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    createAPlaylistService,
    getAPlaylistService,
    deletePlaylistService,
    getAllMyPlaylistsService,
    updatePlaylistService,
}