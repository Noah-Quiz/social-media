/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAPackageDto:
 *       type: object
 *       required:
 *         - coin
 *         - dateUnit
 *         - numberOfDateUnit
 *       properties:
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

class CreateAPackageDto {
  constructor(coin, dateUnit, numberOfDateUnit) {
    this.coin = coin;
    this.dateUnit = dateUnit;
    this.numberOfDateUnit = numberOfDateUnit;
  }
}
