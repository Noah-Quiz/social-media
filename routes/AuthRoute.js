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

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Login with Google
 *     description: Initiates the Google OAuth login flow. Redirects the user to the Google login page.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google for authentication
 *         headers:
 *           Location:
 *             description: URL to Google's OAuth 2.0 login page
 *             schema:
 *               type: string
 *               example: https://accounts.google.com/o/oauth2/auth
 *       500:
 *         description: Internal server error
 *
 */
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Receive Google OAuth2 callback
 *     description: After the user logs in with Google, Google will redirect the user back to this endpoint. This endpoint will then authenticate the user and log them in.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginGoogleDto'
 *     responses:
 *      200:
 *       description: Login with Google successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.loginGoogleController
);

/**
 * @swagger
 * /api/auth/apple:
 *   get:
 *     summary: Login with Apple
 *     description: Initiates the Apple OAuth login flow. Redirects the user to the Apple login page.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Aplle for authentication
 *         headers:
 *           Location:
 *             description: URL to Aplle's OAuth 2.0 login page
 *             schema:
 *               type: string
 *               example: https://accounts.apple.com/o/oauth2/auth
 *       500:
 *         description: Internal server error
 *
 */
authRoutes.get("/apple", passport.authenticate("apple"));

/**
 * @swagger
 * /api/auth/apple/callback:
 *   post:
 *     summary: Receive Apple OAuth2 callback
 *     description: After the user logs in with Apple, Apple will redirect the user back to this endpoint. This endpoint will then authenticate the user and log them in.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginAppleDto'
 *     responses:
 *      200:
 *       description: Login with Apple successfully
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 *
 */
authRoutes.post(
  "/apple/callback",
  express.urlencoded({ extended: true }),
  authController.loginAppleController
);

/**
 * @swagger
 * /api/auth/send/email/{email}:
 *   get:
 *     summary: Send verification email to user
 *     tags: [Auth]
 *     parameters:
 *      - in: path
 *        name: email
 *        schema:
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Send verification email successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.get(
  "/send/email/:email",
  authController.sendVerificationEmailController
);

/**
 * @swagger
 * /api/auth/verify/email:
 *   post:
 *     summary: Verify user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailDto'
 *     responses:
 *       200:
 *         description: Verify email successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/verify/email", authController.verifyEmailController);

/**
 * @swagger
 * /api/auth/send/phone:
 *   post:
 *     summary: Send verification SMS to user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendVerificationPhoneDto'
 *     responses:
 *       200:
 *         description: Send verification SMS successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/send/phone", authController.sendVerificationPhoneController);

/**
 * @swagger
 * /api/auth/verify/phone:
 *   post:
 *     summary: Verify user phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPhoneDto'
 *     responses:
 *       200:
 *         description: Verify phone number successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post("/verify/phone", authController.verifyPhoneController);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Create reset password token
 *     description: Send reset password token to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResetPasswordTokenDto'
 *     responses:
 *       200:
 *         description: Create reset password token successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post(
  "/reset-password",
  authController.createResetPasswordTokenController
);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     description: Reset user password by token
 *     tags: [Auth]
 *     parameters:
 *      - in: path
 *        name: token
 *        schema:
 *         type: string
 *         required: true
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/ResetPasswordDto'
 *     responses:
 *       200:
 *         description: Reset password successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRoutes.post(
  "/reset-password/:token",
  authController.resetPasswordController
);

module.exports = authRoutes;
