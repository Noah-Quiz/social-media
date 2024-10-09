const express = require("express");
const passport = require("passport");
const AuthController = require("../controllers/AuthController");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const authRoutes = express.Router();
const authController = new AuthController();
require("../utils/passportAuth");
authRoutes.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
authRoutes.use(passport.initialize());
authRoutes.use(passport.session());

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
authRoutes.post(
  "/apple/callback",
  express.urlencoded({ extended: true }),
  authController.loginApple
);

authRoutes.get("/send/email", authController.sendVerificationEmail);
authRoutes.get("/verify/email", authController.verifyEmail);

authRoutes.post("/send/phone", authController.sendVerificationPhone);
authRoutes.post("/verify/phone", authController.verifyPhone);

module.exports = authRoutes;
