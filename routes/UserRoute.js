const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const { uploadImage } = require("../utils/stores/storeImage");
const HistoryController = require("../controllers/HistoryController");
const userController = new UserController();
const historyController = new HistoryController();

const route = express.Router();

// route.use(AuthMiddleware);

route.get("/wallet", userController.getUserWalletController);

route.put("/wallet", userController.updateUserWalletController);

route.post("/follow", userController.toggleFollowController);

route.post("/history", historyController.createHistoryRecordController);

route.get("/history", historyController.getAllHistoryRecordsController);

route.delete("/history", historyController.clearAllHistoryRecordsController);

route.delete("/history/:historyId", historyController.deleteHistoryRecordController);

route.put("/profile/:userId", uploadImage.single("avatar"), userController.updateUserProfileByIdController);

route.put("/email/:userId", userController.updateUserEmailByIdController);

route.put("/password/:userId", userController.updateUserPasswordByIdController);

route.get("/:userId", userController.getUserByIdController);

route.delete("/:userId", requireRole(UserEnum.ADMIN), userController.deleteUserByIdController);

route.put("/watch-time", userController.updateTotalWatchTimeController);

module.exports = route;
