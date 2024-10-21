const express = require("express");
const packageRoutes = express.Router();
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdvertisementPackageController = require("../controllers/AdvertisementPackageController");
const packageController = new AdvertisementPackageController();

// packageRoutes.use(AuthMiddleware);
/**
 * @swagger
 * /api/advertisement-packages/:
 *  get:
 *   summary: Get all packages
 *   tags: [Advertisement Package]
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
 *    tags: [Advertisement Package]
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
 * /api/advertisement-packages/:
 *  put:
 *    summary: Update a package by id
 *    tags: [Advertisement Package]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdatePackageDto'
 *    200:
 *      description: Update a package by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
packageRoutes.put("/", packageController.updateAPackageByIdController);

/**
 * @swagger
 * /api/advertisement-packages/{packageId}:
 *  get:
 *   summary: Get package by id
 *   tags: [Advertisement Package]
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
 *   tags: [Advertisement Package]
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
