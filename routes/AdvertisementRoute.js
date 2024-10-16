const express = require("express");
const advertisementRoutes = express.Router();
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdvertisementController = require("../controllers/AdvertisementController");
const advertisementController = new AdvertisementController();

advertisementRoutes.use(AuthMiddleware);
advertisementRoutes.post(
  "/",
  advertisementController.createAnAdvertisementController
);

advertisementRoutes.get(
  "/",
  advertisementController.getAllAvailableAdvertisementsController
);

advertisementRoutes.put(
  "/update",
  advertisementController.updateAnAdvertisementByIdController
);

advertisementRoutes.get(
  "/:adsId",
  advertisementController.getAnAdvertisementByIdController
);

advertisementRoutes.delete(
  "/delete/:adsId",
  advertisementController.deleteAnAdvertisementByIdController
);

module.exports = advertisementRoutes;
