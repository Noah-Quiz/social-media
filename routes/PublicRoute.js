const publicRoutes = [
  // Categories
  {
    path: "/api/categories",
    method: "GET",
  },
  {
    path: "/api/categories/:categoryId",
    method: "GET",
  },

  // Comments
  {
    path: "/api/comments/:commentId/children",
    method: "GET",
  },
  {
    path: "/api/comments/video/:videoId",
    method: "GET",
  },
  {
    path: "/api/comments/:commentId",
    method: "GET",
  },

  // Video
  {
    path: "/api/videos",
    method: "GET",
  },
  {
    path: "/api/videos/:videoId",
    method: "GET",
  },
  {
    path: "/api/videos/user/:userId",
    method: "GET",
  },
  {
    path: "/api/videos/my-playlist/:playlistId",
    method: "GET",
  },

  // Stream
  {
    path: "/api/streams",
    method: "GET",
  },
  {
    path: "/api/streams/:streamId",
    method: "GET",
  },

  // Playlist
  {
    path: "/api/my-playlists/:playlistId",
    method: "GET"
  },
  {
    path: "/api/my-playlists/user/:userId",
    method: "GET"
  },

  // User 
  {
    path: "/api/users",
    method: "GET"
  },
  {
    path: "/api/users/:userId",
    method: "GET"
  },
];

module.exports = publicRoutes;
