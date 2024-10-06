const express = require("express");
const passport = require("passport");
const AuthController = require("../controllers/AuthController");
const authRoutes = express.Router();
const authController = new AuthController();

authRoutes.post("/auth/signup", authController.signUp);

authRoutes.post("/auth/login", authController.login);

authRoutes.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.loginGoogle
);

authRoutes.get("/auth/send-verify-email", authController.sendVerificationEmail);
authRoutes.get("/auth/verify", authController.verifyEmail);

module.exports = authRoutes;