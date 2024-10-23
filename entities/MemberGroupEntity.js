const mongoose = require("mongoose");
const baseEntitySchema = require("./BaseEntity");

// Define the MemberGroup schema
const memberGroupSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Types.ObjectId,
    ref: "User", // Reference to the User model for the owner
    required: true,
  },
  members: [
    {
      memberId: {
        type: mongoose.Types.ObjectId,
        ref: "User", // Reference to the User model for each member
        required: true,
      },
      joinDate: {
        type: Date,
        default: Date.now,
      },
      package: {
        type: mongoose.Types.ObjectId,
        ref: "MemberPack",
        required: true,
      },
      endDate: {
        type: Date,
        require: true,
      },
    },
  ],
  ...baseEntitySchema.obj,
});

// Create the MemberGroup model
const MemberGroup = mongoose.model("MemberGroup", memberGroupSchema);

module.exports = MemberGroup;
