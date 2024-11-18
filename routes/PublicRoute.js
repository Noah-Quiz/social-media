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
  {
    path: "/api/videos/relevant",
    method: "GET",
  },
  {
    path: "api/videos/recommendation",
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
  {
    path: "/api/streams/relevant",
    method: "GET",
  },
  {
    path: "api/streams/recommendation",
    method: "GET",
  },

  // Playlist
  {
    path: "/api/my-playlists/:playlistId",
    method: "GET",
  },
  {
    path: "/api/my-playlists/user/:userId",
    method: "GET",
  },

  // User
  {
    path: "/api/users",
    method: "GET",
  },
  {
    path: "/api/users/:userId",
    method: "GET",
  },
  //Gifts
  {
    path: "/api/gifts/",
    method: "GET",
  },
  {
    path: "/api/gifts/:id",
    method: "GET",
  },
];

module.exports = publicRoutes;
