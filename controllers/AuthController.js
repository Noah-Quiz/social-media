const { signUp, login } = require("../services/AuthService");
const createAccessToken = require("../utils/createAccessToken");
require("dotenv").config();

class AuthController {
  async signUp(req, res) {
    const { fullName, email, password } = req.body;
    const ipAddress = req.socket.remoteAddress;
    try {
      const user = await signUp(fullName, email, password, ipAddress);
      res.status(201).json({ message: "Signup successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await login(email, password);
      const accessToken = createAccessToken(
        user._id,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRE
      );

      res.status(200).json({ accessToken, message: "Login successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
