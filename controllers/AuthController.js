const { signUp, login, loginGoogle } = require("../services/AuthService");
const createAccessToken = require("../utils/createAccessToken");
require("dotenv").config();
class AuthController {
  async signUp(req, res) {
    const { fullName, email, password } = req.body;
    try {
      const user = await signUp(fullName, email, password);
      res.status(201).json({ message: "Signup successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    try {
      const user = await login(email, password);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );

      res.status(200).json({ accessToken, message: "Login successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async loginGoogle(req, res) {
    const googleUser = req.user;
    const ipAddress = req.ip || req.socket.remoteAddress;
    try {
      const user = await loginGoogle(googleUser);
      const accessToken = createAccessToken(
        { _id: user._id, ip: ipAddress },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );
      res
        .status(200)
        .json({ accessToken, message: "Login with Google successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
