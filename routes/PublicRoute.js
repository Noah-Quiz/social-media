const publicRoutes = [
  //categories
  {
    path: "/api/categories",
    method: "GET",
  },
  {
    path: "/api/categories/:categoryId",
    method: "GET",
  },

  //comments
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
];

module.exports = publicRoutes;
