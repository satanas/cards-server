'use strict';

var koa = require('koa');
var hbs = require('koa-hbs');
var router = require('koa-route');
var mongoose = require('mongoose');

var Card = require('./models/card');

var app = koa();

// Request logging
app.use(function* (next) {
  const start = new Date();
  yield next;
  const end = new Date();

  console.log([start.toISOString(), "::", this.method, this.url, "processed in", String(end-start), "ms"].join(' '));
});

app.use(hbs.middleware({
  viewPath: __dirname + '/views',
  defaultLayout: 'layout'
}));

app.use(router.get('/cards', function* (next) {
  var cards = yield Card.find();
  yield this.render('gallery', {
    cards: cards
  });
}));

app.use(router.get('/cards/:id', function* (cardId) {
  var card = yield Card.findOne({_id: cardId});
  yield this.render('editor', {
    card: card
  });
}));

app.listen(8001);
