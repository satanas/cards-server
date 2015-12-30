'use strict';

var koa = require('koa');
var hbs = require('koa-hbs');
var router = require('koa-route');
var mongoose = require('mongoose');
var validate = require('koa-validate');
var bodyParser = require('koa-bodyparser');
var _ = require('underscore');

var Card = require('./models/card');
var CardPresenter = require('./presenters//card');

var app = koa();
var CLIENT_HOST = 'http://localhost:8000';

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

app.use(hbs.middleware({
  viewPath: __dirname + '/views',
  partialsPath: __dirname + '/views/partials',
  defaultLayout: 'layout'
}));

app.use(router.get('/cards', function* (next) {
  var cards = yield Card.find();
  yield this.render('cards', {
    cards: cards,
    host: CLIENT_HOST
  });
}));

app.use(router.get('/cards/:id', function* (cardId) {
  var card = CardPresenter(yield Card.findOne({_id: cardId}), false);
  yield this.render('card', {
    card: card,
    host: CLIENT_HOST
  });
}));

app.use(router.post('/cards/:id', function* (cardId) {
  var card = yield Card.findOne({_id: cardId});

  this.checkBody('name').notEmpty();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt();
  this.checkBody('rush').notEmpty().toBoolean();
  this.checkBody('overwhelm').notEmpty().toBoolean();
  this.checkBody('firstStrike').notEmpty().toBoolean();
  this.checkBody('deathtouch').notEmpty().toBoolean();
  this.checkBody('venom').notEmpty().toBoolean();
  this.checkBody('transfusion').notEmpty().toBoolean();
  this.checkBody('vampirism').notEmpty().toBoolean();
  this.checkBody('berserker').notEmpty().toBoolean();
  this.checkBody('flavorText').optional();

  if (!card) {
    // FIXME: Pass error in cookie?
    this.redirect('/cards');
  }

  var errors = _.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  });

  if (!this.errors) {
    var newCard = this.request.body;
    var cost = 0;
    cost += newCard.attack / 2;
    cost += newCard.health / 2;
    newCard.mana = Math.ceil(cost);
    yield Card.update({_id: cardId}, newCard);
    newCard._id = cardId;

    var cardPresenter = CardPresenter(newCard, false);
  } else {
    var cardPresenter = CardPresenter(card, false);
  }

  yield this.render('card', {
    card: cardPresenter,
    host: CLIENT_HOST,
    errors: errors
  });
}));

app.listen(8001);
console.log('WebApp listening on port 8001');
