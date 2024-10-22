const { updateVipService } = require("../services/MemberGroupService");

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
}
module.exports = MemberGroupController;
