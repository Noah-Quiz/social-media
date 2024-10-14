const express = require("express");
const StreamController = require("../controllers/StreamController");
const { uploadImage } = require("../utils/stores/storeImage");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const streamController = new StreamController();
const streamRoutes = express.Router();

streamRoutes.use(AuthMiddleware);

streamRoutes.get("/", streamController.getStreamsController);

streamRoutes.post("/", uploadImage.single("thumbnailImg"), streamController.createStreamController);

streamRoutes.delete("/:streamId", streamController.deleteStreamController);

streamRoutes.get("/:streamId", streamController.getStreamController);

streamRoutes.patch("/:streamId", uploadImage.single("thumbnailImg"), streamController.updateStreamController);

streamRoutes.post("/end/:streamId", streamController.endStreamController);

streamRoutes.get("/stream-url/:streamId", streamController.getStreamUrlController);

module.exports = streamRoutes;
