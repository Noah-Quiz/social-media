const mongoose = require("mongoose");
const StatusCodeEnums = require("../../enums/StatusCodeEnum");
const CoreException = require("../../exceptions/CoreException");
const { validMongooseObjectId } = require("../../utils/validator");

class CreateGroupRoomDto {
    constructor(name, participantIds) {
        this.name = name;
        this.participantIds = participantIds;
    }

    async validate() {
        try {
            if (!this.name) {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    "Name is required"
                );
            }

            // Ensure participantIds is an array before calling map
            if (Array.isArray(this.participantIds) && this.participantIds.length > 0) {
                await Promise.all(
                    this.participantIds.map(async (id) => {
                        if (id && id.length > 0) {
                            try {
                                await validMongooseObjectId(id);
                            } catch (error) {
                                throw new CoreException(
                                    StatusCodeEnums.BadRequest_400,
                                    "Invalid participant ID"
                                );
                            }
                        } else {
                            throw new CoreException(
                                StatusCodeEnums.BadRequest_400,
                                "Participant ID cannot be empty"
                            );
                        }
                    })
                );
            } else if (this.participantIds && this.participantIds.length === 0) {
                throw new CoreException(
                    StatusCodeEnums.BadRequest_400,
                    "Participant IDs cannot be an empty array"
                );
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CreateGroupRoomDto;
