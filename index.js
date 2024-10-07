const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("passport-apple");
const cors = require("cors");
const categoryRoutes = require("./routes/CategoryRoute");
const myPlaylistRoutes = require("./routes/MyPlaylistRoute");
const authRoutes = require("./routes/AuthRoute");
const messageRoutes = require("./routes/MessageRoute");
const app = express();
const userRoute = require("./routes/UserRoute");
const videoRoutes = require("./routes/VideoRoute");

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth
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
    (req, accessToken, refreshToken, idToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
app.get("/", (req, res) => {
  res.send(
    "<a href='/api/auth/google'>Login with Google</a><br>" +
      "<a href='/api/auth/apple'>Login with Apple</a>"
  );
});

// Log API requests
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routers
app.use("/api", authRoutes);
app.use("/api", myPlaylistRoutes);
app.use("/api", categoryRoutes);
app.use("/api/user", userRoute);
app.use("/api", messageRoutes);
app.use("/api", videoRoutes);

// Start server
const port = process.env.DEVELOPMENT_PORT || 4000;

app.listen(port, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  } else {
    console.log(`Server started! Listening on port ${port}`);
  }
});