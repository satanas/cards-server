'use strict';

var koa = require('koa');
var hbs = require('koa-hbs');
var router = require('koa-route');
var mongoose = require('mongoose');

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

app.use(router.get('/gallery', function* (next) {
  yield this.render('gallery', {title: 'ble'});
}));

app.listen(8001);
