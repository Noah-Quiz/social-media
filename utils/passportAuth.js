require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("passport-apple");
const jwt = require("jsonwebtoken");
const assert = require("node:assert");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL:
        "https://social-media-ofm3.onrender.com/api/auth/apple/callback",
      keyID: process.env.APPLE_KEY_ID,
      // privateKeyLocation: `./config/AuthKey_${process.env.APPLE_KEY_ID}.p8`,
      privateKeyString: process.env.APPLE_PRIVATE_KEY,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      const decodedToken = jwt.decode(idToken, { json: true });
      assert(decodedToken != null);

      const firstTimeUser =
        typeof req.query["user"] === "string"
          ? JSON.parse(req.query["user"])
          : undefined;
      const { sub, email, email_verified } = decodedToken;

      const connection = new DatabaseTransaction();
      const user = await connection.userRepository.findUserByEmail(email);
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
