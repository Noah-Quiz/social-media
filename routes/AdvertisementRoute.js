const express = require("express");
const advertisementRoutes = express.Router();
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdvertisementController = require("../controllers/AdvertisementController");
const advertisementController = new AdvertisementController();

// advertisementRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/advertisements/:
 *  post:
 *    tags: [Advertisement]
 *    summary: Create an advertisement
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateAdvertisementDto'
 *    responses:
 *      201:
 *        description: Create advertisement successfully
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
advertisementRoutes.post(
  "/",
  advertisementController.createAnAdvertisementController
);

/**
 * @swagger
 * /api/advertisements/:
 *  get:
 *   summary: Get all advertisements
 *   tags: [Advertisement]
 *   responses:
 *    200:
 *      description: Get packages successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
advertisementRoutes.get(
  "/",
  advertisementController.getAllAvailableAdvertisementsController
);

// advertisementRoutes.put(
//   "/",
//   advertisementController.updateAnAdvertisementByIdController
// );

/**
 * @swagger
 * /api/advertisements/{adsId}:
 *  get:
 *   summary: Get package by id
 *   tags: [Advertisement]
 *   parameters:
 *      - in: path
 *        name: adsId
 *        required: true
 *        schema:
 *          type: string
 *          description: Advertisement ID
 *   responses:
 *    200:
 *      description: Get Advertisement by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
advertisementRoutes.get(
  "/:adsId",
  advertisementController.getAnAdvertisementByIdController
);

/**
 * @swagger
 * /api/advertisements/{adsId}:
 *  delete:
 *   summary: Delete advertisement by id
 *   tags: [Advertisement]
 *   parameters:
 *      - in: path
 *        name: adsId
 *        required: true
 *        schema:
 *          type: string
 *          description: Advertisement ID
 *   responses:
 *    200:
 *      description: Delete Advertisement by id successfully
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
advertisementRoutes.delete(
  "/:adsId",
  advertisementController.deleteAnAdvertisementByIdController
);

advertisementRoutes.put(
  "/extend",
  advertisementController.extendAdvertisementController
);
module.exports = advertisementRoutes;
