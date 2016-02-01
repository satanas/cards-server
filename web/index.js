'use strict';

var _ = require('underscore');
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
var Modification = require('../models/modification');
var Enchantment = require('../models/enchantment');
var CardStorage = require('../models/card_storage');
var CardPresenter = require('../presenters/card');
var cardsController = require('./controllers/cards');

var app = koa();

var cardPresenter = new CardPresenter();

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'images');

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

router.post('/cards/', bodyParse({multipart: true, formidable: { uploadDir: UPLOAD_DIR}}), function* (next) {
  var errors = [];
  var card = null;
  var files = this.request.body.files;
  var cardId = this.request.body.fields.id;

  try {
    this.assertCSRF(this.request.body.fields);
  } catch (e) {
    return this.addErrorAndRespond([{field: null, message: 'Request forbidden: ' + e.toString()}]);
  }

  if (cardId) {
    var card = yield CardStorage.findOne({_id: cardId});
    if (!card)
      return this.addErrorAndRespond([{field: null, message: `Card ${cardId} does not exist`}]);
  }

  // Request validation
  this.checkBody('name').notEmpty();
  this.checkBody('mana').notEmpty().isInt();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();

  this.request.body.fields.enchantments = JSON.parse(this.request.body.fields.enchantments);

  // Image is required for new cards
  if (!cardId && (files.image.name === '' || files.image.size === 0))
    errors.push({field: 'image', message: 'image can not be empty'});

  errors = errors.concat(_.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  }));
  this.errors = errors;

  if (errors.length > 0)
    return this.respondErrors();

  var newCard = new CardStorage(this.request.body.fields);
  newCard.id = cardId ? cardId : newCard._id.toString();

  console.log('newCard', newCard);
  if (files.image.name !== '' && files.image.size > 0) {
    newCard.image = files.image.name;
    fs.rename(files.image.path, path.join(UPLOAD_DIR, files.image.name));
  }

  try {
    if (cardId) {
      delete newCard._id;
      yield CardStorage.update({_id: cardId}, newCard.toJSON());
    } else {
      yield newCard.save();
    }

    var response = {
      card: cardPresenter.render(newCard)
    };
    if (!cardId) {
      response.redirect = true;
      response.url = '/cards/' + newCard.id;
      this.addFlashMessage('success', 'Card saved successfully');
    }
    this.body = response;
  } catch (e) {
    return this.addErrorAndRespond([{field: null, message: 'Error saving card: ' + e.toString()}]);
  }
});

router.delete('/cards/:id', function* (next) {
  var cardId = this.params.id;
  var card = yield CardStorage.findOne({_id: cardId});

  try {
    throw new Error('ble');
    var name = card.name;
    yield card.remove();

    this.addFlashMessage('success', `Card ${name} deleted successfully`);
  } catch (e) {
    return this.addErrorAndRespond([{field: null, message: 'Card not found'}]);
  }

  this.body = {
    redirect: true,
    url: '/cards'
  };
});

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
