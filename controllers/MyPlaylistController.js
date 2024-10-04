const { createAPlaylistService, getAPlaylistService, deletePlaylistService, getAllMyPlaylistsService, updatePlaylistService } = require("../services/MyPlaylistService");

class MyPlaylistController {
    // get a playlist
    async getAPlaylistController(req, res) {
        const { playlistId } = req.params;

        try {
            const playlist = await getAPlaylistService(playlistId);

            res.status(200).json({ playlist, message: "Success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // get all playlists
    async getAllMyPlaylistsController(req, res) {
        const query = {};
        const userId = req.userId;

        const data = { query, userId }

        try {
            const playlists = await getAllMyPlaylistsService(data);

            res.status(200).json({ playlists, message: "Success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //update playlist
    async updatePlaylistController(req, res) {
        const { addedVideoIds, removedVideoIds, name } = req.body;
        const { playlistId } = req.params;

        const data = {
            addedVideoIds, removedVideoIds, name
        }
    
        try {
            const updatedPlaylist = await updatePlaylistService(playlistId, data);
    
            res.status(200).json({ playlist: updatedPlaylist, message: "Success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // delete a playlist
    async deletePlaylist(req, res) {
        const { playlistId } = req.params;

        try {
            await deletePlaylistService(playlistId);

            res.status(200).json({ message: "Success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createAPlaylist(req, res) {
        const { playlistName } = req.body;
        const userId = req.userId;
        
        try {
            const playlist = await createAPlaylistService(userId, playlistName);

            res.status(200).json({ playlist, message: "Success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = MyPlaylistController;