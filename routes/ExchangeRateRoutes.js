const express = require("express");
const ExchangeRateController = require("../controllers/ExchangeRateController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const exchangeRateController = new ExchangeRateController();

const exchangeRateRoutes = express.Router();
// exchangeRateRoutes.use(AuthMiddleware);

exchangeRateRoutes.post(
  "/",
  exchangeRateController.createExchangeRateController
);
exchangeRateRoutes.get("/", exchangeRateController.getExchangeRateController);
exchangeRateRoutes.put(
  "/:id",
  exchangeRateController.updateExchangeRateController
);
exchangeRateRoutes.delete(
  "/:id",
  exchangeRateController.deleteExchangeRateController
);

module.exports = exchangeRateRoutes;
