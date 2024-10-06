const express = require("express");
const {
  followAnUser,
  unfollowAnUser,
  createAnUser,
} = require("../controllers/userController");

const route = express.Router();

route.post("/follow", followAnUser);
route.post("/unfollow", unfollowAnUser);
route.post("/", createAnUser);
module.exports = route;
