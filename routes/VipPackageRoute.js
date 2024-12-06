const express = require("express");
const VipPackageController = require("../controllers/VipPackageController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const requireRole = require("../middlewares/requireRole");
const UserEnum = require("../enums/UserEnum");
const router = express.Router();
const vipPackageController = new VipPackageController();
router.use(AuthMiddleware);
/**
 * @swagger
 * tags:
 *   - name: Vip Package
 *     description: Operations related to managing VIP(Premium) packages.
 */

/**
 * @swagger
 * /api/vip-packages/:
 *   get:
 *     tags:
 *       - Vip Package
 *     summary: Get all VIP packages
 *     description: Retrieve a list of all VIP packages.
 *     responses:
 *       200:
 *         description: Successfully retrieved all VIP packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Packages:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/VipPackage"
 *                 message:
 *                   type: string
 *             example:
 *               Packages:
 *                 - _id: "673d66353eeeef0076d745b9"
 *                   name: "Silver Package"
 *                   description: "Access to basic features"
 *                   price: 100000
 *                   durationUnit: "MONTH"
 *                   durationNumber: 1
 *                   isDeleted: false
 *                   dateCreated: "2024-11-20T04:31:49.293Z"
 *                   lastUpdated: "2024-11-20T04:44:08.713Z"
 *                   __v: 0
 *               message: "Get all vip packages successfully"
 *       400:
 *         description: Bad Request - Invalid input or malformed request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Invalid request format or parameters"
 *       500:
 *         description: Internal Server Error - Something went wrong on the server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "An unexpected error occurred on the server"
 * components:
 *   schemas:
 *     VipPackage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         durationUnit:
 *           type: string
 *         durationNumber:
 *           type: integer
 *         isDeleted:
 *           type: boolean
 *         dateCreated:
 *           type: string
 *           format: date-time
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: integer
 */

router.get("/", (req, res, next) =>
  vipPackageController.getAllVipPackage(req, res, next)
);

/**
 * @swagger
 * /api/vip-packages/{id}:
 *   get:
 *     tags:
 *       - Vip Package
 *     summary: Get a VIP package by ID
 *     description: Retrieve a specific VIP package by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the VIP package to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the VIP package
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Packages:
 *                   $ref: "#/components/schemas/VipPackage"
 *                 message:
 *                   type: string
 *       404:
 *         description: VIP package not found
 */
router.get("/:id", (req, res, next) =>
  vipPackageController.getAVipPackage(req, res, next)
);

/**
 * @swagger
 * /api/vip-packages/:
 *   post:
 *     tags:
 *       - Vip Package
 *     summary: Create a new VIP package
 *     description: Create a new VIP package with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateVipPackageDto"
 *     responses:
 *       201:
 *         description: VIP package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 package:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: integer
 *                     durationUnit:
 *                       type: string
 *                     durationNumber:
 *                       type: integer
 *                     isDeleted:
 *                       type: boolean
 *                     _id:
 *                       type: string
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: integer
 *                 message:
 *                   type: string
 *             example:
 *               package:
 *                 name: "string"
 *                 description: "string"
 *                 price: 1000
 *                 durationUnit: "DAY"
 *                 durationNumber: 4
 *                 isDeleted: false
 *                 _id: "673ea658f15894ebfe4b996d"
 *                 dateCreated: "2024-11-21T03:17:44.996Z"
 *                 lastUpdated: "2024-11-21T03:17:44.996Z"
 *                 __v: 0
 *               message: "Create vip package successfully"
 *       400:
 *         description: Bad Request - Invalid input or malformed request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Invalid request data or missing required fields"
 *       500:
 *         description: Internal Server Error - Something went wrong on the server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "An unexpected error occurred on the server"
 */

router.post("/", requireRole(UserEnum.ADMIN), (req, res, next) =>
  vipPackageController.createVipPackageController(req, res, next)
);

/**
 * @swagger
 * /api/vip-packages/{id}:
 *   put:
 *     tags:
 *       - Vip Package
 *     summary: Update a VIP package
 *     description: Update an existing VIP package by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the VIP package to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateVipPackageDto"
 *     responses:
 *       200:
 *         description: VIP package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 package:
 *                   $ref: "#/components/schemas/VipPackage"
 *                 message:
 *                   type: string
 *       404:
 *         description: VIP package not found
 */
router.put("/:id", requireRole(UserEnum.ADMIN), (req, res, next) =>
  vipPackageController.updateVipPackageController(req, res, next)
);

/**
 * @swagger
 * /api/vip-packages/{id}:
 *   delete:
 *     tags:
 *       - Vip Package
 *     summary: Delete a VIP package
 *     description: Soft delete a VIP package by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the VIP package to delete
 *     responses:
 *       200:
 *         description: VIP package deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: VIP package not found
 */
router.delete("/:id", requireRole(UserEnum.ADMIN), (req, res, next) =>
  vipPackageController.deleteVipPackageController(req, res, next)
);

module.exports = router;
