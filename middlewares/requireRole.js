const { default: mongoose } = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");

const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    const userId = req.userId;

    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({ message: "You do not have permission to perform this action" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = requireRole;
