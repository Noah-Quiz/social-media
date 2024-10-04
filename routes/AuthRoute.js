const express = require("express");
const AuthController = require("../controllers/AuthController");

const authRoutes = express.Router();
const authController = new AuthController();

authRoutes.post("/auth/signup", authController.signUp);
authRoutes.post("/auth/login", authController.login);

module.exports = authRoutes;