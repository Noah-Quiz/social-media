const express = require("express");
const MemberGroupController = require("../controllers/MemberGroupController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const memberGroupController = new MemberGroupController();

const route = express.Router();
route.use(AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Member Group
 *   description: Member Group management APIs
 */

/**
 * @swagger
 * /api/member-group/upgrade-vip:
 *   put:
 *     summary: Upgrade a user to VIP status
 *     tags: [Member Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to upgrade
 *               ownerId:
 *                 type: string
 *                 description: The ID of the owner
 *               packId:
 *                 type: string
 *                 description: The ID of the VIP pack
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             examples:
 *               success:
 *                 summary: Successful VIP upgrade
 *                 value:
 *                   MemberGroup:
 *                     _id: "string"
 *                     ownerId: "string"
 *                     isDeleted: false
 *                     members:
 *                       - memberId: "string"
 *                         joinDate: "2024-11-01T02:21:19.976Z"
 *                         package: "string"
 *                         endDate: "2025-10-27T02:21:19.976Z"
 *                     dateCreated: "2024-10-23T15:00:40.408Z"
 *                     lastUpdated: "2024-10-23T15:00:40.408Z"
 *                     __v: 5
 *                   message: "Success"
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
route.put("/upgrade-vip", memberGroupController.updateVipController);

/**
 * @swagger
 * /api/member-group/:
 *   get:
 *     summary: Get all member groups (Admin only)
 *     tags: [Member Group]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             examples:
 *               allGroups:
 *                 summary: List of all member groups
 *                 value:
 *                   MemberGroup:
 *                     - _id: "string"
 *                       ownerId: "string"
 *                       isDeleted: false
 *                       members:
 *                         - memberId: "string"
 *                           joinDate: "2024-10-23T14:11:23.770Z"
 *                           package: "string"
 *                           endDate: "2024-11-22T14:11:23.770Z"
 *                       dateCreated: "2024-10-23T07:48:02.463Z"
 *                       lastUpdated: "2024-10-23T07:48:02.463Z"
 *                       __v: 2
 *
 *                   message: "Success"
 *       404:
 *         description: No MemberGroup found
 *       500:
 *         description: Internal server error
 */

route.get(
  "/",
  requireRole(UserEnum.ADMIN),
  memberGroupController.getAllMemberGroupController
);

/**
 * @swagger
 * /api/member-group/my-group:
 *   get:
 *     summary: Get the member group of the authenticated user
 *     tags: [Member Group]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             examples:
 *               myGroup:
 *                 summary: Authenticated user’s group
 *                 value:
 *                   MemberGroup:
 *                     _id: "string"
 *                     ownerId: "string"
 *                     isDeleted: false
 *                     members: []
 *                     dateCreated: "2024-10-23T15:00:40.551Z"
 *                     lastUpdated: "2024-10-23T15:00:40.551Z"
 *                     __v: 0
 *                   message: "Success"
 *       404:
 *         description: Member Group not found
 *       500:
 *         description: Internal server error
 */
route.get("/my-group", memberGroupController.getMemberGroupController);

/**
 * @swagger
 * /api/member-group/{ownerId}:
 *   delete:
 *     summary: Delete the member group of the authenticated user
 *     tags: [Member Group]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         description: The ID of the owner of the member group to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             examples:
 *               deletedGroup:
 *                 summary: Successfully deleted member group
 *                 value:
 *                   MemberGroup:
 *                     _id: "string"
 *                     ownerId: "string"
 *                     isDeleted: true
 *                     members: []
 *                     dateCreated: "2024-10-23T15:00:40.551Z"
 *                     lastUpdated: "2024-10-23T15:00:40.551Z"
 *                     __v: 0
 *                   message: "Success"
 *       404:
 *         description: Member Group not found
 *       500:
 *         description: Internal server error
 */

route.delete("/:ownerId", memberGroupController.deleteMemberGroupController);

module.exports = route;
