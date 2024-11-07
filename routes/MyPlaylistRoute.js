const express = require("express");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const MyPlaylistController = require("../controllers/MyPlaylistController");
const { uploadFile } = require("../middlewares/storeFile");
const myPlaylistController = new MyPlaylistController();

const myPlaylistRoutes = express.Router();

/**
 * @swagger
 * /api/my-playlists:
 *   post:
 *     summary: Create a new playlist.
 *     description: Authenticated users can create a playlist with an optional `playlistCreate` thumbnail.
 *     tags: [MyPlaylists]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               playlistName:
 *                 type: string
 *                 example: "No4"
 *                 description: Name of playlist
 *               description:
 *                 type: string
 *                 example: "created no4"
 *                 description: Description of playlist
 *               enumMode:
 *                 type: string
 *                 enum: [public, private]
 *                 description: Enum mode of playlist ([public, private])
 *               playlistCreate:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file for the playlist thumbnail.
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 playlist:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "672aec0251db321e6c9e3354"
 *                     playlistName:
 *                       type: string
 *                       example: "No4"
 *                     description:
 *                       type: string
 *                       example: "created no4"
 *                     thumbnail:
 *                       type: string
 *                       example: "http://localhost:4000/assets/images/playlist/create/1156343_1730866178631.jpg"
 *                     userId:
 *                       type: string
 *                       example: "66f6577eb4ffd9ae01870e72"
 *                     videoIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-11-06T04:09:38.642Z"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-11-06T04:09:38.642Z"
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
  uploadFile.single("playlistCreate"),
  myPlaylistController.createAPlaylist
);

/**
 * @swagger
 * /api/my-playlists/{playlistId}:
 *   patch:
 *     summary: Update a playlist by ID.
 *     description: Updates playlist information, including optional fields like `description` and `playlistUpdate` thumbnail.
 *     tags: [MyPlaylists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               playlistName:
 *                 type: string
 *                 example: "No3 updated"
 *               description:
 *                 type: string
 *                 example: "testCreate3 then update 2"
 *               playlistUpdate:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file for the updated playlist thumbnail.
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 playlist:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "672ada13dd8df7da75f4126a"
 *                     playlistName:
 *                       type: string
 *                       example: "No3 updated"
 *                     description:
 *                       type: string
 *                       example: "testCreate3 then update 2"
 *                     thumbnail:
 *                       type: string
 *                       example: "http://localhost:4000/assets/images/playlist/672ada13dd8df7da75f4126a/1156365_1730866025249.jpg"
 *                     userId:
 *                       type: string
 *                       example: "66f6577eb4ffd9ae01870e72"
 *                     videoIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     dateCreated:
 *                       type: string
 *                       example: "2024-11-06T02:53:07.535Z"
 *                     lastUpdated:
 *                       type: string
 *                       example: "2024-11-06T04:07:05.559Z"
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
  uploadFile.single("playlistUpdate"),
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
 *                   example: "An unexpected error occurred while retrieve the playlist."
 */
myPlaylistRoutes.get(
  "/:playlistId",
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

/**
 * @swagger
 * /api/my-playlists/{playlistId}/add-video:
 *   put:
 *     summary: Add a video to a playlist.
 *     tags: [MyPlaylists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the playlist to add the video to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *                 example: "60c72b2f9f1b2c0017f9d2e5"
 *                 description: The ID of the video to be added to the playlist.
 *     responses:
 *       200:
 *         description: Video added to playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video added to playlist successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid videoId or playlistId"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error adding video to playlist"
 */

myPlaylistRoutes.put(
  "/:playlistId/add-video",
  AuthMiddleware,
  myPlaylistController.addToPlaylistController
);

/**
 * @swagger
 * /api/my-playlists/{playlistId}/remove-video:
 *   put:
 *     summary: Remove a video from a playlist.
 *     tags: [MyPlaylists]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the playlist from which the video will be removed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *                 example: "60c72b2f9f1b2c0017f9d2e5"
 *                 description: The ID of the video to be removed from the playlist.
 *     responses:
 *       200:
 *         description: Video removed from playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video removed from playlist successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid videoId or playlistId"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error removing video from playlist"
 */

myPlaylistRoutes.put(
  "/:playlistId/remove-video",
  AuthMiddleware,
  myPlaylistController.removeFromPlaylist
);
module.exports = myPlaylistRoutes;
