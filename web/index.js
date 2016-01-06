'use strict';

var koa = require('koa');
var hbs = require('koa-hbs');
var serve = require('koa-serve');
var router = require('koa-router')();
var mongoose = require('mongoose');
var validate = require('koa-validate');
var bodyParser = require('koa-bodyparser');
var _ = require('underscore');

var Global = require('../global');
var CardStorage = require('../models/card_storage');
var CardPresenter = require('../presenters/card');

var app = koa();

mongoose.connect('mongodb://localhost/magic');

// Request logging
app.use(function* (next) {
  const start = new Date();
  yield next;
  const end = new Date();

  console.log([start.toISOString(), "::", this.method, this.url, "processed in", String(end-start), "ms"].join(' '));
});

app.use(bodyParser());
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
    card: CardPresenter({}),
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

router.post('/cards/:id', function* (next) {
  var cardId = this.params.id;
  var card = yield CardStorage.findOne({_id: cardId});

  this.checkBody('name').notEmpty();
  this.checkBody('mana').notEmpty().isInt();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();

  if (!card) {
    // FIXME: Pass error in cookie?
    this.redirect('/cards');
  }

  var errors = _.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  });

  var newCard = new CardStorage(this.request.body);
  newCard._id = cardId;
  newCard.id = cardId;
  if (!this.request.body.image) newCard.image = card.image;

  if (!this.errors) {
    yield CardStorage.update({_id: cardId}, newCard);
  } else {
    this.status = 400;
  }

  var cardPresenter = CardPresenter(newCard);

  this.body = {
    card: cardPresenter,
    errors: errors
  };
});

router.post('/cards', function* (next) {
  this.checkBody('name').notEmpty();
  this.checkBody('image').notEmpty();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();
  this.checkBody('flavorText').optional();

  var errors = _.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  });

  var newCard = new CardStorage(this.request.body);
  newCard.id = newCard._id.toString();

  if (!this.errors) {
    var cost = 0;
    cost += newCard.attack / 2;
    cost += newCard.health / 2;
    newCard.mana = Math.ceil(cost);

    yield newCard.save();
  }

  var cardPresenter = CardPresenter(newCard);

  if (this.errors) {
    yield this.render('card', {
      card: cardPresenter,
      errors: errors,
      isNew: true
    });
  } else {
    this.redirect('/cards/' + newCard._id);
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
