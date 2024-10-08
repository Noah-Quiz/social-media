const express = require("express");
const passport = require("passport");
const AuthController = require("../controllers/AuthController");
const authRoutes = express.Router();
const authController = new AuthController();

authRoutes.post("/signup", authController.signUp);

authRoutes.post("/login", authController.login);

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.loginGoogle
);

authRoutes.get("/apple", passport.authenticate("apple"));
authRoutes.post("/apple/callback", authController.loginApple);

authRoutes.get("/send/email", authController.sendVerificationEmail);
authRoutes.get("/verify/email", authController.verifyEmail);

authRoutes.post("/send/phone", authController.sendVerificationPhone);
authRoutes.post("/verify/phone", authController.verifyPhone);

module.exports = authRoutes;
