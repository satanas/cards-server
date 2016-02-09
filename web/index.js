'use strict';

var os = require('os');
var fs = require('fs');
var koa = require('koa');
var path = require('path');
var hbs = require('koa-hbs');
var serve = require('koa-serve');
var bodyParse = require('koa-body');
var router = require('koa-router')();
var session = require('koa-session');
var validate = require('koa-validate');
var mongoose = require('mongoose');

var Global = require('../global');
var flash = require('./middleware/flash');
var errorResponse = require('./middleware/error_response');
var cardsController = require('./controllers/cards');

var app = koa();

const UPLOAD_DIR = os.tmpdir();

mongoose.connect('mongodb://localhost/magic');

// Init session
app.keys = ['123456', 'foobar'];
app.use(session(app));
require('koa-csrf')(app);

// Request logging
app.use(function* (next) {
  const start = new Date();
  yield next;
  const end = new Date();

  console.log([start.toISOString(), "::", this.method, this.url, "processed in", String(end-start), "ms"].join(' '));
});

app.use(validate());
app.use(serve('public'));
app.use(flash);
app.use(errorResponse);

hbs.registerHelper('if_lt_eight', function(conditional, options) {
  if (conditional < 8) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.use(hbs.middleware({
  viewPath: __dirname + '/views',
  partialsPath: __dirname + '/views/partials',
  layoutsPath: __dirname + '/views/layouts'
}));

router.get('/', function* (next) {
  yield this.render('game');
});

router.get('/cards', cardsController.listCards);

router.get('/cards/new', cardsController.getCard);

router.get('/cards/:id', cardsController.getCard);

router.post('/cards/', bodyParse({multipart: true, formidable: { uploadDir: UPLOAD_DIR}}), cardsController.saveCard);

router.delete('/cards/:id', cardsController.destroyCard);

app.use(router.routes());

app.listen(8000);
console.log('WebApp listening on port 8000');

validate.Validator.prototype.clearAttributes = function() {
  Global.ABILITIES.forEach(function(key) {
    if (this.params[key] === 'null' || this.params[key] === null) delete this.params[key];
    if (this.params[key] === 'false') this.params[key] = false;
    if (this.params[key] === 'true') this.params[key] = true;
  }, this)
};
