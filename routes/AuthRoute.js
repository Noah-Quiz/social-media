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

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupDto'
 *     responses:
 *       201:
 *         description: Signup successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/signup", authController.signUpController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Login successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/login", authController.loginController);

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.loginGoogleController
);

authRoutes.get("/apple", passport.authenticate("apple"));
authRoutes.post(
  "/apple/callback",
  express.urlencoded({ extended: true }),
  authController.loginAppleController
);

authRoutes.get("/send/email", authController.sendVerificationEmailController);
authRoutes.get("/verify/email", authController.verifyEmailController);

authRoutes.post("/send/phone", authController.sendVerificationPhoneController);
authRoutes.post("/verify/phone", authController.verifyPhoneController);

authRoutes.post(
  "/reset-password",
  authController.createResetPasswordTokenController
);
authRoutes.post(
  "/reset-password/:token",
  authController.resetPasswordController
);

module.exports = authRoutes;
