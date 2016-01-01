'use strict';
var mongoose = require('mongoose');

var cardSchema = mongoose.Schema({
  id: String,
  type: Number,
  attack: Number,
  health: Number,
  maxHealth: Number,
  name: String,
  image: String,
  mana: Number,
  description: String,
  flavorText: {type: String, default: ''},
  firstStrike: {type: Boolean, default: false},
  rush: {type: Boolean, default: false},
  overwhelm: {type: Boolean, default: false},
  deathtouch: {type: Boolean, default: false},
  venom: {type: Boolean, default: false},
  transfusion: {type: Boolean, default: false},
  vampirism: {type: Boolean, default: false},
  berserker: {type: Boolean, default: false},
},
{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

cardSchema.virtual('playerId').get(function () {
  return this.__playerId;
}).set(function (value) {
  this.__playerId = value;
});

cardSchema.virtual('sick').get(function () {
  return this.__sick;
}).set(function (value) {
  this.__sick = value;
});

cardSchema.virtual('used').get(function () {
  return this.__used;
}).set(function (value) {
  this.__used = value;
});

cardSchema.virtual('played').get(function () {
  return this.__played;
}).set(function (value) {
  this.__played = value;
});

cardSchema.virtual('invenomed').get(function () {
  return this.__invenomed;
}).set(function (value) {
  this.__invenomed = value;
});

cardSchema.virtual('secondAttack').get(function () {
  return this.__secondAttack;
}).set(function (value) {
  this.__secondAttack = value;
});

cardSchema.post('init', function(obj) {
  obj.set('sick', true);
  obj.set('used', false);
  obj.set('played', false);
  obj.set('invenomed', false);
  obj.set('secondAttack', false);
});

var Card = mongoose.model('Card', cardSchema);

//Card.prototype.sick = true;
//Card.prototype.used = false;
//Card.prototype.played = false;
//Card.prototype.invenomed = false;
//Card.prototype.secondAttack = false;

Card.prototype.heal = function(value) {
  this.health += value;
  if (this.health > this.maxHealth) this.health = this.maxHealth;
};

module.exports = Card;
