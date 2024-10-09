/**
 * @swagger
 * components:
 *  schemas:
 *   UserRoles:
 *    type: object
 *    properties:
 *     ADMIN:
 *      type: number
 *      roleId: 1
 *      description: Admin role
 *     USER:
 *      type: number
 *      roleId: 0
 *      description: User role
 */

const UserEnum = {
  ADMIN: 1,
  USER: 0,
};

module.exports = UserEnum;
