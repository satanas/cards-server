'use strict';

var koa = require('koa');
var hbs = require('koa-hbs');
var serve = require('koa-serve');
var router = require('koa-route');
var mongoose = require('mongoose');

var Card = require('./models/card');

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

app.use(serve('public'));

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
  var card = yield Card.findOne({_id: cardId});
  card.abilities = [
    {
      name: 'rush',
      value: card.rush
    },
    {
      name: 'overwhelm',
      value: card.overwhelm
    },
    {
      name: 'firstStrike',
      value: card.firstStrike
    },
    {
      name: 'deathtouch',
      value: card.deathtouch
    },
    {
      name: 'venom',
      value: card.venom
    },
    {
      name: 'transfusion',
      value: card.transfusion
    },
    {
      name: 'vampirism',
      value: card.vampirism
    },
    {
      name: 'berserker',
      value: card.berserker
    }
  ];
  card.new = false;
  yield this.render('card', {
    card: card,
    host: CLIENT_HOST
  });
}));

app.listen(8001);
console.log('WebApp listening on port 8001');
