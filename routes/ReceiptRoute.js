const express = require("express");
const ReceiptController = require("../controllers/ReceiptController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const receiptController = new ReceiptController();

const route = express.Router();

// Apply the authentication mid dleware to all routes
route.use(AuthMiddleware);

route.get("/", receiptController.getAllUserReceiptsController);
route.get("/:id", receiptController.getReceiptController);
route.delete("/:id", receiptController.deleteReceiptController);

module.exports = route;
