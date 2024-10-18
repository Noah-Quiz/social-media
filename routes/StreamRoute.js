const express = require("express");
const StreamController = require("../controllers/StreamController");
const { uploadImage } = require("../utils/stores/storeImage");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const streamController = new StreamController();
const streamRoutes = express.Router();

streamRoutes.get("/live-input", streamController.listLiveInputsController);

streamRoutes.post("/live-input", streamController.createLiveInputController);

streamRoutes.put(
  "/live-input/:streamId",
  AuthMiddleware,
  streamController.updateLiveInputController
);

streamRoutes.delete(
  "/live-input/:streamId",
  AuthMiddleware,
  streamController.deleteLiveInputController
);

streamRoutes.get("/", streamController.getStreamsController);

streamRoutes.post(
  "/",
  AuthMiddleware,
  uploadImage.single("thumbnailImg"),
  streamController.createStreamController
);

streamRoutes.delete(
  "/:streamId",
  AuthMiddleware,
  streamController.deleteStreamController
);

streamRoutes.get("/:streamId", streamController.getStreamController);

streamRoutes.patch(
  "/:streamId",
  AuthMiddleware,
  uploadImage.single("thumbnailImg"),
  streamController.updateStreamController
);

streamRoutes.post(
  "/end/:streamId",
  AuthMiddleware,
  streamController.endStreamController
);

streamRoutes.post(
  "/reset-stream-key/:streamId",
  AuthMiddleware,
  streamController.resetStreamKeyController
);

streamRoutes.get(
  "/playback-token/:streamId",
  AuthMiddleware,
  streamController.createMuxTokenController
);

module.exports = streamRoutes;
