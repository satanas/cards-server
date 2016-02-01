module.exports = function *(next) {
  this.errors = [];

  this.addError = function(error) {
    this.errors.push(error);
  };

  this.respondErrors = function(status) {
    this.status = status || 400;
    this.body = {
      errors: this.errors
    };
  };

  this.addErrorAndRespond = function(error, status) {
    this.addError(error);
    this.respondErrors(status);
  };

  yield next;
}
