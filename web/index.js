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
  var errors = [],
      card = null,
      files = this.request.body.files,
      cardId = this.request.body.fields.id;

  try {
    this.assertCSRF(this.request.body.fields);
  } catch (e) {
    return errorResponse(this, [{field: null, message: 'Request forbidden: ' + e.toString()}]);
  }

  // Request validation
  this.checkBody('name').notEmpty();
  this.checkBody('mana').notEmpty().isInt();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();

  this.request.body.fields.enchantments = JSON.parse(this.request.body.fields.enchantments);
  console.log('new enchantments', this.request.body.fields.enchantments);

  errors = errors.concat(_.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  }));

  if (errors.length > 0)
    return errorResponse(this, errors);

  if (cardId) {
    // Existing cards
    card = yield CardStorage.findOne({_id: cardId});
    if (!card)
      return errorResponse(this, [{field: null, message: `Card ${cardId} does not exist`}]);
  } else {
    // New cards
    if (files.image.name === '' || files.image.size === 0) {
      errors.push({field: 'image', message: 'image can not be empty'});
    }
  }

  this.body = 'ok';
  //var newCard = new CardStorage(this.request.body.fields);
  //newCard._id = cardId;
  //newCard.id = cardId;

  //console.log('newCard', newCard.toJSON());
  //if (files.image.name !== '' && files.image.size > 0) {
  //  newCard.image = files.image.name;
  //  fs.rename(files.image.path, path.join(UPLOAD_DIR, files.image.name));
  //}
  //

  //try {
  //  yield CardStorage.update({_id: cardId}, newCard);

  //  this.body = {
  //    card: cardPresenter.render(newCard)
  //  };
  //} catch (e) {
  //  return errorResponse(this, [{field: null, message: 'Error saving card: ' + e.toString()}]);
  //}
  //

//  var newCard = new CardStorage(this.request.body.fields);
//  newCard.id = newCard._id.toString();
//
//  try {
//    newCard.image = files.image.name;
//    fs.rename(files.image.path, path.join(UPLOAD_DIR, files.image.name));
//
//    yield newCard.save();
//
//    this.body = {
//      card: cardPresenter.render(newCard),
//      redirect: true,
//      flash: addFlashMessage(this, 'success', 'Card saved successfully'),
//      url: '/cards/' + newCard.id
//    };
//  } catch (e) {
//    return errorResponse(this, [{field: null, message: 'Error saving card: ' + e.toString()}]);
//  }
});

//router.post('/cards', bodyParse({multipart: true, formidable: { uploadDir: UPLOAD_DIR}}), function* (next) {
//  var errors = [],
//      files = this.request.body.files;
//
//  try {
//    this.assertCSRF(this.request.body.fields);
//  } catch (e) {
//    return errorResponse(this, [{field: null, message: 'Request forbidden: ' + e.toString()}]);
//  }
//
//  this.checkBody('name').notEmpty();
//  this.checkBody('mana').notEmpty().isInt();
//  this.checkBody('attack').notEmpty().isInt();
//  this.checkBody('health').notEmpty().isInt().gt(0);
//  this.checkBody('type').notEmpty().isInt();
//  this.checkBody('').clearAttributes();
//
//  errors = errors.concat(_.map(this.errors, function(err) {
//    for(var i in err) return { field: i, message: err[i] }
//  }));
//
//  if (files.image.name === '' || files.image.size === 0) {
//    errors.push({field: 'image', message: 'image can not be empty'});
//  }
//
//  if (errors.length > 0)
//    return errorResponse(this, errors);
//
//  var newCard = new CardStorage(this.request.body.fields);
//  newCard.id = newCard._id.toString();
//
//  try {
//    newCard.image = files.image.name;
//    fs.rename(files.image.path, path.join(UPLOAD_DIR, files.image.name));
//
//    yield newCard.save();
//
//    this.body = {
//      card: cardPresenter.render(newCard),
//      redirect: true,
//      flash: addFlashMessage(this, 'success', 'Card saved successfully'),
//      url: '/cards/' + newCard.id
//    };
//  } catch (e) {
//    return errorResponse(this, [{field: null, message: 'Error saving card: ' + e.toString()}]);
//  }
//});

router.delete('/cards/:id', function* (next) {
  var cardId = this.params.id,
      card = yield CardStorage.findOne({_id: cardId});

  try {
    var name = card.name;
    yield card.remove();

    this.addFlashMessage('success', "Card '" + name + "' deleted successfully");
  } catch (e) {
    return errorResponse(this, [{field: null, message: 'Card not found'}]);
  }

  this.body = {
    redirect: true,
    url: '/cards'
  }
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

function errorResponse(ctx, errors, status) {
  ctx.status = status || 400;
  ctx.body = {
    errors: errors
  };
}
