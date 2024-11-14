const express = require("express");
const packageRoutes = express.Router();
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdvertisementPackageController = require("../controllers/AdvertisementPackageController");
const packageController = new AdvertisementPackageController();

packageRoutes.use(AuthMiddleware);
/**
 * @swagger
 * /api/advertisement-packages/:
 *  get:
 *   summary: Get all packages
 *   tags: [Advertisement Packages]
 *   responses:
 *    200:
 *      description: Get all packages successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
packageRoutes.get("/", packageController.getAllAvailablePackageController);

/**
 * @swagger
 * /api/advertisement-packages/:
 *  post:
 *    tags: [Advertisement Packages]
 *    summary: Create a package
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateAPackageDto'
 *    responses:
 *      201:
 *        description: Create package successfully
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
packageRoutes.post("/", packageController.createAPackageController);

/**
 * @swagger
 * /api/advertisement-packages/{id}:
 *   put:
 *     summary: Update an advertisement package by ID
 *     tags: [Advertisement Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the package to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coin:
 *                 type: integer
 *               dateUnit:
 *                 type: string
 *               numberOfDateUnit:
 *                 type: integer
 *             required:
 *               - coin
 *               - dateUnit
 *               - numberOfDateUnit
 *     responses:
 *       200:
 *         description: Package updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

packageRoutes.put("/:id", packageController.updateAPackageByIdController);

/**
 * @swagger
 * /api/advertisement-packages/{packageId}:
 *  get:
 *   summary: Get package by id
 *   tags: [Advertisement Packages]
 *   parameters:
 *      - in: path
 *        name: packageId
 *        required: true
 *        schema:
 *          type: string
 *          description: Package ID
 *   responses:
 *    200:
 *      description: Get Package by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
packageRoutes.get("/:id", packageController.getAPackageByIdController);

/**
 * @swagger
 * /api/advertisement-packages/{packageId}:
 *  delete:
 *   summary: Delete package by id
 *   tags: [Advertisement Packages]
 *   parameters:
 *      - in: path
 *        name: packageId
 *        required: true
 *        schema:
 *          type: string
 *          description: Package ID
 *   responses:
 *    200:
 *      description: Delete Package by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
packageRoutes.delete("/:id", packageController.deleteAPackageByIdController);

module.exports = packageRoutes;
