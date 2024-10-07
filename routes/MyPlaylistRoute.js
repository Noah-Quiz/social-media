const express = require("express");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const MyPlaylistController = require("../controllers/MyPlaylistController");

const myPlaylistController = new MyPlaylistController();

const myPlaylistRoutes = express.Router();

myPlaylistRoutes.post(
  "/",
  AuthMiddleware,
  myPlaylistController.createAPlaylist
);

myPlaylistRoutes.patch(
  "/:playlistId",
  AuthMiddleware,
  myPlaylistController.updatePlaylistController
);

myPlaylistRoutes.delete(
  "/:playlistId",
  AuthMiddleware,
  myPlaylistController.deletePlaylist
);

myPlaylistRoutes.get(
  "/:playlistId",
  AuthMiddleware,
  myPlaylistController.getAPlaylistController
);

myPlaylistRoutes.get(
  "/user/:userId",
  AuthMiddleware,
  myPlaylistController.getAllMyPlaylistsController
);

module.exports = myPlaylistRoutes;
