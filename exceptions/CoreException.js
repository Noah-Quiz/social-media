class CoreException extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
module.exports = CoreException;
