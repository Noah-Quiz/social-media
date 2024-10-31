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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Playlist created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     playlistName:
 *                       type: string
 *                       example: "Electronics"
 *                     userId:
 *                      type: string
 *                      example: "607d1b2f9f1b2c0017f9d2e5"
 *                     videoIds:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example: ["607d1b2f9f1b2c0017f9d2e5", "607d1b2f9f1b2c0017f9d2e5"]
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: 'name' is required."
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["'name' is required."]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while creating the playlist."
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
 *       200:
 *         description: Update playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Playlist updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     playlistName:
 *                       type: string
 *                       example: "Electronics"
 *                     userId:
 *                      type: string
 *                      example: "607d1b2f9f1b2c0017f9d2e5"
 *                     videoIds:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example: ["607d1b2f9f1b2c0017f9d2e5", "607d1b2f9f1b2c0017f9d2e5"]
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: 'videoIds' does not exist."
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["'name' is required."]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while updating the category."
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
 *      200:
 *       description: Delete playlist successfully
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Delete successfully"
 *      400:
 *       description: Bad request
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Playlist not found"
 *      500:
 *       description: Internal server error
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while delete the playlist."
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
 *       200:
 *         description: Get playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get Playlist successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607d1b2f9f1b2c0017f9d2e5"
 *                     playlistName:
 *                       type: string
 *                       example: "Electronics"
 *                     userId:
 *                      type: string
 *                      example: "607d1b2f9f1b2c0017f9d2e5"
 *                     videoIds:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example: ["607d1b2f9f1b2c0017f9d2e5", "607d1b2f9f1b2c0017f9d2e5"]
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while retrive the playlist."
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
 *       200:
 *         description: Get all playlists successfully
 *         content:
 *          application/json:
 *            schema:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 _id:
 *                   type: string
 *                   example: "607d1b2f9f1b2c0017f9d2e5"
 *                 playlistName:
 *                   type: string
 *                   example: "Electronics"
 *                 userId:
 *                  type: string
 *                  example: "607d1b2f9f1b2c0017f9d2e5"
 *                 videoIds:
 *                  type: array
 *                  items:
 *                    type: string
 *                  example: ["607d1b2f9f1b2c0017f9d2e5", "607d1b2f9f1b2c0017f9d2e5"]
 *                 dateCreated:
 *                   type: string
 *                   example: "2024-10-25T02:29:35.346+00:00"
 *                 lastUpdated:
 *                   type: string
 *                   example: "2024-10-25T02:29:35.346+00:00"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to do this action"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while retrive the playlist."
 */
myPlaylistRoutes.get(
  "/user/:userId",
  AuthMiddleware,
  myPlaylistController.getAllMyPlaylistsController
);

module.exports = myPlaylistRoutes;
