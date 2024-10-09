const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const userController = new UserController();

const route = express.Router();

route.use(AuthMiddleware);

route.post("/follow", userController.toggleFollowController);

route.get("/", userController.getAllUsersController);
route.get("/:userId", userController.getUserByIdController);

route.put("/profile/:userId", userController.updateUserProfileByIdController);
route.put("/email/:userId", userController.updateUserEmailByIdController);

route.delete("/:userId", userController.deleteUserByIdController);

module.exports = route;
