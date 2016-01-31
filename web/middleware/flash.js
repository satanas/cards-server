module.exports = function *(next) {
  this.addFlashMessage = function(type, message) {
    this.session.flash = {
      type: type,
      message: message
    };
  }

  this.getFlashMessage = function() {
    var flash = this.session.flash;
    if (flash) delete this.session.flash;
    return flash;
  }
  yield next;
}
