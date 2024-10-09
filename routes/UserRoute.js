const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const userController = new UserController();

const route = express.Router();

route.use(AuthMiddleware);

route.get("/", userController.getAllUsersController);

route.post("/follow", userController.toggleFollowController);

route.get("/:userId", userController.getAnUserByIdController);

route.put("/profile/:userId", userController.updateUserProfileByIdController);
route.put("/email/:userId", userController.updateUserEmailByIdController);

route.delete("/:userId", userController.deleteUserByIdController);

module.exports = route;
