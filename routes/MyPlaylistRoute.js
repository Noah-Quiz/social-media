const express = require("express");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const MyPlaylistController = require("../controllers/MyPlaylistController");

const myPlaylistController = new MyPlaylistController();

const myPlaylistRoutes = express.Router();

/**
 * @swagger
 * /api/my-playlists:
 *   post:
 *     summary: Create a playlist.
 *     description: Only authenticated user can create their playlists.
 *     tags: [MyPlaylists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlaylistDto'
 *     responses:
 *       201:
 *         description: Create playlist successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
myPlaylistRoutes.post(
  "/",
  AuthMiddleware,
  myPlaylistController.createAPlaylist
);

/**
 * @swagger
 * /api/my-playlists/{playlistId}:
 *   patch:
 *     summary: Update a playlist.
 *     description: An array of added video ids and removed video ids.
 *     tags: [MyPlaylists]
 *     parameters:
 *      - in: path
 *        name: playlistId
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlaylistDto'
 *     responses:
 *       201:
 *         description: Update playlist successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
myPlaylistRoutes.patch(
  "/:playlistId",
  AuthMiddleware,
  myPlaylistController.updatePlaylistController
);

/**
 * @swagger
 * /api/my-playlists/{playlistId}:
 *   delete:
 *     summary: Delete a playlist by ID.
 *     tags: [MyPlaylists]
 *     parameters:
 *      - in: path
 *        name: playlistId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Delete playlist successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
myPlaylistRoutes.delete(
  "/:playlistId",
  AuthMiddleware,
  myPlaylistController.deletePlaylist
);

/**
 * @swagger
 * /api/my-playlists/{playlistId}:
 *   get:
 *     summary: Get a playlist by ID.
 *     tags: [MyPlaylists]
 *     parameters:
 *      - in: path
 *        name: playlistId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Get playlist successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
myPlaylistRoutes.get(
  "/:playlistId",
  AuthMiddleware,
  myPlaylistController.getAPlaylistController
);

/**
 * @swagger
 * /api/my-playlists/user/{userId}:
 *   get:
 *     summary: Get all playlists of a user by userId.
 *     tags: [MyPlaylists]
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Get playlists successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
myPlaylistRoutes.get(
  "/user/:userId",
  AuthMiddleware,
  myPlaylistController.getAllMyPlaylistsController
);

module.exports = myPlaylistRoutes;
