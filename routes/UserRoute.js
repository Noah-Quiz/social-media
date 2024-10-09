const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const userController = new UserController();

const route = express.Router();

route.use(AuthMiddleware);

route.get("/", userController.getAllUsersController);

route.post("/follow", userController.toggleFollowController);

route.get("/:userId", userController.getAnUserByIdController);

route.put("/update/profile/:userId", userController.updateUserProfileByIdController);
route.put("/update/email/:userId", userController.updateUserEmailByIdController);

route.delete("/:userId", userController.deleteAnUserByIdController);

module.exports = route;
