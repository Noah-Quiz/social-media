const express = require("express");
const MemberPackController = require("../controllers/MemberPackController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const memberPackController = new MemberPackController();

const route = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Member Packs
 *     description: Operations related to Member Packs
 */

/**
 * @swagger
 * /api/member-pack/:
 *   get:
 *     summary: Retrieve all member packs
 *     tags: [Member Packs]
 *     responses:
 *       200:
 *         description: A list of member packs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberPack:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CreateMemberPackDto'
 *                 size:
 *                   type: integer
 *                 message:
 *                   type: string
 *       404:
 *         description: No MemberPack found
 */
route.get("/", memberPackController.getAllMemberPackController);
/**
 * @swagger
 * /api/member-pack/{id}:
 *   get:
 *     summary: Get a specific member pack by ID
 *     tags: [Member Packs]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the member pack
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member pack found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberPack:
 *                   $ref: '#/components/schemas/CreateMemberPackDto'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       404:
 *         description: Member pack not found
 *       500:
 *         description: Server error
 */

route.get("/:id", memberPackController.getMemberPackController);

/**
 * @swagger
 * /api/member-pack/:
 *   post:
 *     summary: Create a new member pack
 *     tags: [Member Packs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               durationUnit:
 *                 type: string
 *               durationNumber:
 *                 type: number
 *     responses:
 *       201:
 *         description: Member pack created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberPack:
 *                   $ref: '#/components/schemas/CreateMemberPackDto'
 *                 message:
 *                   type: string
 *                   example: "Member Pack created successfully"
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
route.post(
  "/",
  AuthMiddleware,
  requireRole(UserEnum.ADMIN),
  memberPackController.createMemberPackController
);

/**
 * @swagger
 * /api/member-pack/{id}:
 *   put:
 *     summary: Update a member pack
 *     tags: [Member Packs]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the member pack to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               durationUnit:
 *                 type: string
 *               durationNumber:
 *                 type: number
 *     responses:
 *       200:
 *         description: Member pack updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberPack:
 *                   $ref: '#/components/schemas/UpdateMemberPackDto'
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       404:
 *         description: Member pack not found
 *       500:
 *         description: Server error
 */

route.put(
  "/:id",
  AuthMiddleware,
  requireRole(UserEnum.ADMIN),
  memberPackController.updateMemberPackController
);

/**
 * @swagger
 * /api/member-pack/{id}:
 *   delete:
 *     summary: Delete a member pack
 *     tags: [Member Packs]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the member pack to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member pack deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberPack:
 *                   type: object
 *                   $ref: '#/components/schemas/UpdateMemberPackDto'
 *                 message:
 *                   type: string
 *                   example: "Member Pack deleted successfully"
 *             example:
 *               memberPack:
 *                 _id: "67234a7f94efbef093dcefa5"
 *                 name: "string"
 *                 description: "string"
 *                 price: 20
 *                 durationUnit: "DAY"
 *                 durationNumber: 1
 *                 isDeleted: true
 *                 dateCreated: "2024-10-31T09:14:39.349Z"
 *                 lastUpdated: "2024-10-31T09:14:39.349Z"
 *                 __v: 0
 *               message: "Member Pack deleted successfully"
 *       404:
 *         description: Member pack not found
 *       500:
 *         description: Server error
 */

route.delete(
  "/:id",
  AuthMiddleware,
  requireRole(UserEnum.ADMIN),
  memberPackController.deleteMemberPackController
);

module.exports = route;
