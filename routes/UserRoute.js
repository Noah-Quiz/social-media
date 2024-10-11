const express = require("express");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const {uploadImage} = require("../utils/stores/storeImage");
const HistoryController = require("../controllers/HistoryController");
const userController = new UserController();
const historyController = new HistoryController();

const route = express.Router();

route.use(AuthMiddleware);

route.get("/wallet", userController.getUserWalletController);

route.put("/update-wallet", userController.updateUserWalletController);

route.post("/follow", userController.toggleFollowController);

route.post("/history", historyController.createHistoryRecordController);

route.get("/history", historyController.getAllHistoryRecordsController);

route.delete("/history", historyController.clearAllHistoryRecordsController);

route.get("/:userId", userController.getUserByIdController);

route.put(
  "/profile/:userId",
  //   calculateFileSize,
  uploadImage.single("avatar"),
  userController.updateUserProfileByIdController
);

route.put("/email/:userId", userController.updateUserEmailByIdController);

route.put("/password/:userId", userController.updateUserPasswordByIdController);

route.delete(
  "/:userId",
  requireRole(UserEnum.ADMIN),
  userController.deleteUserByIdController
);

module.exports = route;
