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

    // Get a playlist by ID
    async getAPlaylistRepository(playlistId) {
        try {
            const playlist = await MyPlaylist.findOne({ _id: playlistId, isDeleted: false })

            if (!playlist) {
                throw new Error("Playlist not found");
            }

            return playlist;
        } catch (error) {
            throw new Error(`Error finding playlist: ${error.message}`);
        }
    }

    // Update a playlist
    async updatePlaylistRepository(playlistId, updateData) {
        try {
            const playlist = await MyPlaylist.findById(playlistId);
    
            if (!playlist) {
                throw new Error('Playlist not found');
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
    };    

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
            const playlists = await MyPlaylist.find({ userId: data.userId, isDeleted: false })
            .populate('videos')
            
            return playlists;
        } catch (error) {
            throw new Error(`Error fetching streams: ${error.message}`);
        }
    }
}

module.exports = MyPlaylistRepository;
