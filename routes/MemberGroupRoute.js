const express = require("express");
const MemberGroupController = require("../controllers/MemberGroupController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const memberGroupController = new MemberGroupController();

const route = express.Router();
route.use(AuthMiddleware);

route.put("/upgrade-vip", memberGroupController.updateVipController);

module.exports = route;
