const express = require("express");
const UserController = require("../controllers/UserController");
const userController = new UserController();

const route = express.Router();

route.post("/follow", userController.followAnUserController);
route.post("/unfollow", userController.unfollowAnUserController);

route.get("/", userController.getAllUsersController);
route.get("/:userId", userController.getAnUserByIdController);
route.put("/:userId", userController.updateAnUserByIdController);
route.delete("/:userId", userController.deleteAnUserByIdController);

module.exports = route;
