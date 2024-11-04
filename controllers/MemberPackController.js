const {
  createMemberPackService,
  deleteMemberPackService,
  getAllMemberPackService,
  getMemberPackService,
  updateMemberPackService,
} = require("../services/MemberPackService");

const CreateMemberPackDto = require("../dtos/MemberPack/CreateMemberPackDto");
const UpdateMemberPackDto = require("../dtos/MemberPack/UpdateMemberPackDto");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const CoreException = require("../exceptions/CoreException");

class MemberPackController {
  async getAllMemberPackController(req, res, next) {
    try {
      const result = await getAllMemberPackService();
      if (!result || result.length === 0) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No Member Pack found"
        );
      }
      res
        .status(StatusCodeEnums.OK_200)
        .json({ memberPack: result, size: result.length, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async getMemberPackController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await getMemberPackService(id);
      if (!result) {
        throw new CoreException(
          StatusCodeEnums.NotFound_404,
          "No Member Pack found"
        );
      }
      res
        .status(StatusCodeEnums.OK_200)
        .json({ memberPack: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async createMemberPackController(req, res, next) {
    try {
      const {
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted,
      } = req.body;

      // Create DTO and validate
      const createMemberPackDto = new CreateMemberPackDto(
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted
      );
      await createMemberPackDto.validate();
      const result = await createMemberPackService(
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted
      );
      res.status(StatusCodeEnums.Created_201).json({
        memberPack: result,
        message: "Member Pack created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberPackController(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted,
      } = req.body;

      // Create DTO and validate
      const updateMemberPackDto = new UpdateMemberPackDto({
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted,
      });
      await updateMemberPackDto.validate();
      const result = await updateMemberPackService(
        id,
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted
      );
      res
        .status(StatusCodeEnums.OK_200)
        .json({ memberPack: result, message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  async deleteMemberPackController(req, res, next) {
    const { id } = req.params;
    try {
      const result = await deleteMemberPackService(id);
      return res.status(StatusCodeEnums.OK_200).json({
        memberPack: result,
        message: "Member Pack deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MemberPackController;
