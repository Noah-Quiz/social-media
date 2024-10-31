class CoreException {
  code;
  message;
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}
module.exports = CoreException;
