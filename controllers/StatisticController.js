const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");
const {
  countNewUsersService,
  countRevenueService,
  countStreamsService,
  countVideosService,
} = require("../services/StatisticService");

class StatisticController {
  async countNewUsersController(req, res) {
    try {
      const newUsers = await countNewUsersService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ newUsers, message: "Count new users successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async countRevenueController(req, res) {
    try {
      const revenue = await countRevenueService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ revenue, message: "Count revenue successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async countTotalStreamsController(req, res) {
    try {
      const streams = await countStreamsService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ streams, message: "Count streams successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }

  async countTotalVideosController(req, res) {
    try {
      const videos = await countVideosService();
      res
        .status(StatusCodeEnums.OK_200)
        .json({ videos, message: "Count videos successfully" });
    } catch (error) {
      if (error instanceof CoreException) {
        res.status(error.code).json({ message: error.message });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: error.message });
      }
    }
  }
}

module.exports = StatisticController;
