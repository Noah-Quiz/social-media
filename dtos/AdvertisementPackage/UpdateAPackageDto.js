/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePackageDto:
 *       type: object
 *       required:
 *         - coin
 *         - dateUnit
 *         - numberOfDateUnit
 *       properties:
 *         id:
 *          type: string
 *          default: 6715d3076bf9bc86307f184a
 *          description: ID of package
 *         coin:
 *           type: number
 *           default: 5000
 *           description: Coin need for this package
 *         dateUnit:
 *           type: string
 *           default: MONTH
 *           description: DAY, MONTH, YEAR
 *         numberOfDateUnit:
 *           type: number
 *           default: 1
 *           description: 1 year, 2 month
 */

class UpdateAPackageDto {
  constructor(id, coin, dateUnit, numberOfDateUnit) {
    this.id = id;
    this.coin = coin;
    this.dateUnit = dateUnit;
    this.numberOfDateUnit = numberOfDateUnit;
  }
}
