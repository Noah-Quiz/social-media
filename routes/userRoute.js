const express = require("express");
const { followAUser, unfollowAUser } = require("../controller/userController");

const route = express.Router();

route.post("/follow/:userId/:followId", followAUser);
route.post("/unfollow/:userId/:followId", unfollowAUser);

module.exports = route;
