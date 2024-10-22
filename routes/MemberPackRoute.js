const express = require("express");
const MemberPackController = require("../controllers/MemberPackController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const memberPackController = new MemberPackController();

const route = express.Router();
route.use(AuthMiddleware);
route.get("/", memberPackController.getAllMemberPackController);
route.put(
  "/:id",
  requireRole(UserEnum.ADMIN),
  memberPackController.updateMemberPackController
);
route.post(
  "/",
  requireRole(UserEnum.ADMIN),
  memberPackController.createMemberPackController
);
route.delete(
  "/:id",
  requireRole(UserEnum.ADMIN),
  memberPackController.deleteMemberPackController
);
route.get("/:id", memberPackController.getMemberPackController);

module.exports = route;
