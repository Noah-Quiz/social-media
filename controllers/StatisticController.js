const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  countNewUsersService,
  countRevenueService,
  countStreamsService,
  countVideosService,
  calculateStreamViewsService,
} = require("../services/StatisticService");

class StatisticController {
  async countNewUsersController(req, res, next) {
    try {
      const newUsers = await countNewUsersService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ newUsers, message: "Count new users successfully" });
    } catch (error) {
      next(error);
    }
  }

  async countRevenueController(req, res, next) {
    try {
      const revenue = await countRevenueService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ revenue, message: "Count revenue successfully" });
    } catch (error) {
      next(error);
    }
  }

  async countTotalStreamsController(req, res, next) {
    try {
      const streams = await countStreamsService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ streams, message: "Count streams successfully" });
    } catch (error) {
      next(error);
    }
  }

  async countTotalVideosController(req, res, next) {
    try {
      const videos = await countVideosService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ videos, message: "Count videos successfully" });
    } catch (error) {
      next(error);
    }
  }

  async calculateStreamViewsController(req, res, next) {
    try {
      const streams = await calculateStreamViewsService();
      res.status(StatusCodeEnums.OK_200).json({
        streams,
        message: "Calculate stream views successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatisticController;
