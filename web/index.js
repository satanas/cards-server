'use strict';

var fs = require('fs');
var koa = require('koa');
var path = require('path');
var hbs = require('koa-hbs');
var serve = require('koa-serve');
var router = require('koa-router')();
var mongoose = require('mongoose');
var validate = require('koa-validate');
var bodyParse = require('koa-body');
var _ = require('underscore');

var Global = require('../global');
var CardStorage = require('../models/card_storage');
var CardPresenter = require('../presenters/card');

var app = koa();

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'images');

mongoose.connect('mongodb://localhost/magic');

// Request logging
app.use(function* (next) {
  const start = new Date();
  yield next;
  const end = new Date();

  console.log([start.toISOString(), "::", this.method, this.url, "processed in", String(end-start), "ms"].join(' '));
});

app.use(validate());
app.use(serve('public'));

app.use(hbs.middleware({
  viewPath: __dirname + '/views',
  partialsPath: __dirname + '/views/partials',
  layoutsPath: __dirname + '/views/layouts'
}));

router.get('/', function* (next) {
  yield this.render('game');
});

router.get('/cards', function* (next) {
  var cards = yield CardStorage.find().sort({ _id: 1});
  yield this.render('cards', {
    cards: cards
  });
});

router.get('/cards/new', function* (next) {
  yield this.render('card', {
    card: CardPresenter(new CardStorage()),
    isNew: true
  });
});

router.get('/cards/:id', function* (next) {
  var cardId = this.params.id,
      card = CardPresenter(yield CardStorage.findOne({_id: cardId}));

  yield this.render('card', {
    card: card,
    isNew: false
  });
});

router.post('/cards/:id', bodyParse({multipart: true, formidable: { uploadDir: UPLOAD_DIR}}), function* (next) {
  var errors = [],
      files = this.request.body.files,
      cardId = this.params.id,
      card = yield CardStorage.findOne({_id: cardId});

  this.checkBody('name').notEmpty();
  this.checkBody('mana').notEmpty().isInt();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();

  if (!card)
    return errorResponse(this, [{field: null, message: 'That card doesn\'t exist'}]);

  errors = errors.concat(_.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  }));

  if (errors.length > 0)
    return errorResponse(this, errors);

  var newCard = new CardStorage(this.request.body.fields);
  newCard._id = cardId;
  newCard.id = cardId;

  if (files.image.name !== '' && files.image.size > 0) {
    newCard.image = files.image.name;
    fs.rename(files.image.path, path.join(UPLOAD_DIR, files.image.name));
  }

  try {
    yield CardStorage.update({_id: cardId}, newCard);
    var cardPresenter = CardPresenter(newCard);

    this.body = {
      card: cardPresenter
    };
  } catch (e) {
    return errorResponse(this, [{field: null, message: 'Error saving card: ' + e.toString()}]);
  }
});

router.post('/cards', bodyParse({multipart: true, formidable: { uploadDir: UPLOAD_DIR}}), function* (next) {
  var errors = [],
      files = this.request.body.files;

  this.checkBody('name').notEmpty();
  this.checkBody('mana').notEmpty().isInt();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();

  errors = errors.concat(_.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  }));

  if (files.image.name === '' || files.image.size === 0) {
    errors.push({field: 'image', message: 'image can not be empty'});
  }

  if (errors.length > 0)
    return errorResponse(this, errors);

  var newCard = new CardStorage(this.request.body.fields);
  newCard.id = newCard._id.toString();

  try {
    newCard.image = files.image.name;
    fs.rename(files.image.path, path.join(UPLOAD_DIR, files.image.name));

    yield newCard.save();
    var cardPresenter = CardPresenter(newCard);

    this.body = {
      card: cardPresenter,
      redirect: true,
      url: '/cards/' + newCard.id + '?op=s' // Indicates that the operation was successful
    };
  } catch (e) {
    return errorResponse(this, [{field: null, message: 'Error saving card: ' + e.toString()}]);
  }
});

router.delete('/cards/:id', function* (next) {
  var cardId = this.params.id;

  console.log('deleting card', cardId);
  this.body = {
    redirect: true,
    url: '/cards?op=s' // Indicates that the operation was successful
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
