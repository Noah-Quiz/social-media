const path = require("path");
const getLogger = require("../utils/logger");
const logger = getLogger("AUDIT_LOG_ERROR");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const auditLogError = async (err, req, res, next) => {
  // Get the stack trace
  const stack = err.stack || "";

  // Parse stack trace to extract file and function information
  const match = stack.match(/\s+at (\S+) \((.*):(\d+):(\d+)\)/);
  const functionName = match ? match[1] : "Unknown function";
  const filePath = match ? match[2] : "Unknown file";
  const fileName = path.basename(filePath);

  const logMessage = `
  An error occurred in the application
  Code: ${err.code || StatusCodeEnums.InternalServerError_500}
  Message: ${err.message}
  File: ${fileName}
  Function: ${functionName}
  Stack Trace:
  ${stack}
  `;
  logger.error(logMessage);
  try {
    // Save the error to the database
    const errorData = {
      code: err.code.toString() || "500",
      message: err.message,
      file: fileName,
      function: functionName,
      stackTrace: stack,
    };
    const connection = new DatabaseTransaction();
    const res = await connection.errorRepository.createErrorRepository(
      errorData
    );
    logger.info(`Error saved to database with ID: ${res._id}`);
  } catch (error) {
    logger.error(`Error saving error to database: ${error.message}`);
  } finally {
    if (typeof err.code === "string")
      return res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: err.message });
    return res
      .status(err.code || StatusCodeEnums.InternalServerError_500)
      .json({ message: err.message });
  }
};

module.exports = auditLogError;
