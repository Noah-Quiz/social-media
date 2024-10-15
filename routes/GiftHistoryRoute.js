const express = require("express");
const GiftHistoryController = require("../controllers/GiftHistoryController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const giftHistoryController = new GiftHistoryController();

const giftHistoryRoutes = express.Router();
giftHistoryRoutes.use(AuthMiddleware);

giftHistoryRoutes.post("/", giftHistoryController.createGiftHistoryController);

giftHistoryRoutes.get(
  "/streams/:streamId",
  giftHistoryController.getGiftHistoryByStreamIdController
);

giftHistoryRoutes.get(
  "/",
  giftHistoryController.getGiftHistoryByUserIdController
);

giftHistoryRoutes.get("/:id", giftHistoryController.getGiftController);

giftHistoryRoutes.delete(
  "/:id",
  giftHistoryController.deleteGiftHistoryController
);

module.exports = giftHistoryRoutes;
