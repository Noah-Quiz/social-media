const express = require("express");
const advertisementRoutes = express.Router();
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdvertisementController = require("../controllers/AdvertisementController");
const advertisementController = new AdvertisementController();

advertisementRoutes.use(AuthMiddleware);

/**
 * @swagger
 * /api/advertisements/:
 *  post:
 *    tags: [Advertisements]
 *    summary: Create an advertisement
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateAdvertisementDto'
 *    responses:
 *      201:
 *        description: Advertisement created successfully
 *        content:
 *          application/json:
 *            example:
 *              data:
 *                userId: "66f6577eb4ffd9ae01870e72"
 *                videoId: "67064b3bc2a457f6b8780cd6"
 *                advertisementPackages: ["6715d3076bf9bc86307f184a"]
 *                currentPackageIndex: 0
 *                totalCoin: 1000
 *                rank: 1000
 *                isAdvertised: true
 *                expDate: "2025-05-01T07:20:14.917Z"
 *                isDeleted: false
 *                _id: "6724812ec872827cf3118e9e"
 *                dateCreated: "2024-11-01T07:20:14.920Z"
 *                lastUpdated: "2024-11-01T07:20:14.920Z"
 *              message: "Advertisement created successfully"
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
 *   tags: [Advertisements]
 *   responses:
 *    200:
 *      description: Retrieve all advertisements successfully
 *      content:
 *        application/json:
 *          example:
 *            data:
 *              - _id: "6724812ec872827cf3118e9e"
 *                userId: "66f6577eb4ffd9ae01870e72"
 *                videoId: "67064b3bc2a457f6b8780cd6"
 *                advertisementPackages: ["6715d3076bf9bc86307f184a"]
 *                currentPackageIndex: 0
 *                totalCoin: 1000
 *                rank: 1000
 *                isAdvertised: true
 *                expDate: "2025-05-01T07:20:14.917Z"
 *                isDeleted: false
 *                dateCreated: "2024-11-01T07:20:14.920Z"
 *                lastUpdated: "2024-11-01T07:20:14.920Z"
 *            message: "Success"
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
 *   tags: [Advertisements]
 *   parameters:
 *      - in: path
 *        name: adsId
 *        required: true
 *        schema:
 *          type: string
 *          description: Advertisement ID
 *   responses:
 *    200:
 *      description: Retrieve advertisement by ID successfully
 *      content:
 *        application/json:
 *          example:
 *            data:
 *              _id: "67248065716f77d0ae1d1d87"
 *              userId: "66f6577eb4ffd9ae01870e72"
 *              videoId: "67064b3bc2a457f6b8780cd6"
 *              advertisementPackages: ["6715d3076bf9bc86307f184a"]
 *              currentPackageIndex: 0
 *              totalCoin: 1000
 *              rank: 1000
 *              isAdvertised: false
 *              expDate: "2025-05-01T07:16:52.999Z"
 *              isDeleted: true
 *              dateCreated: "2024-11-01T07:16:53.002Z"
 *              lastUpdated: "2024-11-01T07:16:53.002Z"
 *            message: "Success"
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
 *   tags: [Advertisements]
 *   parameters:
 *      - in: path
 *        name: adsId
 *        required: true
 *        schema:
 *          type: string
 *          description: Advertisement ID
 *   responses:
 *    200:
 *      description: Delete advertisement by ID successfully
 *      content:
 *        application/json:
 *          example:
 *            data:
 *              _id: "67248065716f77d0ae1d1d87"
 *              userId: "66f6577eb4ffd9ae01870e72"
 *              videoId: "67064b3bc2a457f6b8780cd6"
 *              advertisementPackages: ["6715d3076bf9bc86307f184a"]
 *              currentPackageIndex: 0
 *              totalCoin: 1000
 *              rank: 1000
 *              isAdvertised: false
 *              expDate: "2025-05-01T07:16:52.999Z"
 *              isDeleted: true
 *              dateCreated: "2024-11-01T07:16:53.002Z"
 *              lastUpdated: "2024-11-01T07:16:53.002Z"
 *            message: "Advertisement deleted successfully"
 *    400:
 *      description: Bad request
 *    500:
 *      description: Internal server error
 */
advertisementRoutes.delete(
  "/:adsId",
  advertisementController.deleteAnAdvertisementByIdController
);
/**
 * @swagger
 * /api/advertisements/extend:
 *   put:
 *     summary: Extend an advertisement package
 *     tags: [Advertisements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adsId:
 *                 type: string
 *                 description: The advertisement ID to extend
 *                 example: "67248065716f77d0ae1d1d87"
 *               packageId:
 *                 type: string
 *                 description: The new package ID to apply to the advertisement
 *                 example: "6715d3076bf9bc86307f184a"
 *     responses:
 *       200:
 *         description: Advertisement extended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67248065716f77d0ae1d1d87"
 *                     userId:
 *                       type: string
 *                       example: "66f6577eb4ffd9ae01870e72"
 *                     videoId:
 *                       type: string
 *                       example: "67064b3bc2a457f6b8780cd6"
 *                     advertisementPackages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["6715d3076bf9bc86307f184a"]
 *                     currentPackageIndex:
 *                       type: integer
 *                       example: 1
 *                     totalCoin:
 *                       type: integer
 *                       example: 1500
 *                     rank:
 *                       type: integer
 *                       example: 1100
 *                     isAdvertised:
 *                       type: boolean
 *                       example: true
 *                     expDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-01T07:20:14.917Z"
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-01T07:20:14.920Z"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-01T08:20:14.920Z"
 *       400:
 *         description: Bad request - invalid adsId or packageId
 *       500:
 *         description: Internal server error
 */
advertisementRoutes.put(
  "/extend",
  advertisementController.extendAdvertisementController
);
module.exports = advertisementRoutes;
