const express = require('express');
const MyPlaylistController = require('../controllers/MyPlaylistController');
const myPlaylistController = new MyPlaylistController();

const myPlaylistRoutes = express.Router();

myPlaylistRoutes.post('/my-playlists', myPlaylistController.createAPlaylist);

myPlaylistRoutes.patch('/my-playlists/:playlistId',  myPlaylistController.updatePlaylistController);

myPlaylistRoutes.delete('/my-playlists/:playlistId', myPlaylistController.deletePlaylist);

myPlaylistRoutes.get('/my-playlists/:playlistId', myPlaylistController.getAPlaylistController);

myPlaylistRoutes.get('/my-playlists/user/:userId', myPlaylistController.getAllMyPlaylistsController);

module.exports = myPlaylistRoutes;
