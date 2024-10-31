const {
  createMemberPackService,
  deleteMemberPackService,
  getAllMemberPackService,
  getMemberPackService,
  updateMemberPackService,
} = require("../services/MemberPackService");

const CreateMemberPackDto = require("../dtos/MemberPack/CreateMemberPackDto");
const UpdateMemberPackDto = require("../dtos/MemberPack/UpdateMemberPackDto");

class MemberPackController {
  async getAllMemberPackController(req, res) {
    try {
      const result = await getAllMemberPackService();
      if (!result || result.length === 0) {
        return res.status(404).json({ message: "No MemberPack found" });
      }
      res
        .status(200)
        .json({ memberPack: result, size: result.length, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  }

  async getMemberPackController(req, res) {
    const { id } = req.params;
    try {
      const result = await getMemberPackService(id);
      if (!result) {
        return res.status(404).json({ message: "Member Pack not found" });
      }
      res.status(200).json({ memberPack: result, message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createMemberPackController(req, res) {
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
    try {
      await createMemberPackDto.validate();
      const result = await createMemberPackService(
        name,
        description,
        price,
        durationUnit,
        durationNumber,
        isDeleted
      );
      res.status(201).json({
        memberPack: result,
        message: "Member Pack created successfully",
      });
    } catch (error) {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  async updateMemberPackController(req, res) {
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
    try {
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
      res.status(200).json({ memberPack: result, message: "Success" });
    } catch (error) {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  async deleteMemberPackController(req, res) {
    const { id } = req.params;
    try {
      const result = await deleteMemberPackService(id);
      return res.status(200).json({
        memberPack: result,
        message: "Member Pack deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = MemberPackController;
