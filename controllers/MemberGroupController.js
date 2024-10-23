const {
  updateVipService,
  getAllMemberGroupService,
  deleteMemberGroupService,
  getMemberGroupService,
} = require("../services/MemberGroupService");

class MemberGroupController {
  async updateVipController(req, res) {
    const { userId, ownerId, packId } = req.body;
    if (!userId || !ownerId || !packId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      const result = await updateVipService(userId, ownerId, packId);
      return res.status(200).json({ MemberGroup: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getMemberGroupController(req, res) {
    const ownerId = req.userId;
    try {
      const result = await getMemberGroupService(ownerId);
      if (!result) {
        return res.status(404).json({ message: "Member Group not found" });
      }
      return res.status(200).json({ MemberGroup: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getAllMemberGroupController(req, res) {
    try {
      const result = await getAllMemberGroupService();
      if (!result) {
        return res.status(404).json({ message: "No MemberGroup found" });
      }
      return res.status(200).json({ MemberGroup: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async deleteMemberGroupController(req, res) {
    const ownerId = req.userId;
    console.log("Controller: ", ownerId);
    try {
      const result = await deleteMemberGroupService(ownerId);
      if (!result) {
        return res.status(404).json({ message: "Member Group not found" });
      }
      return res.status(200).json({ MemberGroup: result, message: "Success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
module.exports = MemberGroupController;
