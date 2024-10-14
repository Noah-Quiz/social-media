const express = require("express");
const GiftController = require("../controllers/GiftController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const giftController = new GiftController();

const giftRoutes = express.Router();
giftRoutes.use(AuthMiddleware);

giftRoutes.post("/", giftController.createGiftController);
giftRoutes.get("/", giftController.getAllGiftController);
giftRoutes.get("/:id", giftController.getGiftController);
giftRoutes.put("/:id", giftController.updateGiftController);
giftRoutes.delete("/:id", giftController.deleteGiftController);

module.exports = giftRoutes;
