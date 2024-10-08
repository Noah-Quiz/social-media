const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const userController = new UserController();

const route = express.Router();

route.use(AuthMiddleware);

route.get("/", userController.getAllUsersController);

route.post("/follow", userController.toggleFollowController);

route.get("/:userId", userController.getAnUserByIdController);

route.put("/:userId", userController.updateAnUserByIdController);

route.delete("/:userId", userController.deleteAnUserByIdController);

module.exports = route;
