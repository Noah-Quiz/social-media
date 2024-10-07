const express = require('express');
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const MyPlaylistController = require('../controllers/MyPlaylistController');
const myPlaylistController = new MyPlaylistController();

const myPlaylistRoutes = express.Router();

myPlaylistRoutes.post('/my-playlists', AuthMiddleware, myPlaylistController.createAPlaylist);

myPlaylistRoutes.patch('/my-playlists/:playlistId', AuthMiddleware, myPlaylistController.updatePlaylistController);

myPlaylistRoutes.delete('/my-playlists/:playlistId', AuthMiddleware, myPlaylistController.deletePlaylist);

myPlaylistRoutes.get('/my-playlists/:playlistId', AuthMiddleware, myPlaylistController.getAPlaylistController);

myPlaylistRoutes.get('/my-playlists/user/:userId', AuthMiddleware, myPlaylistController.getAllMyPlaylistsController);

module.exports = myPlaylistRoutes;
