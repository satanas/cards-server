'use strict';
var mongoose = require('mongoose');

var cardSchema = mongoose.Schema({
  type: String,
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
});

var Card = mongoose.model('Card', cardSchema);

Card.prototype.sick = true;
Card.prototype.used = false;
Card.prototype.played = false;
Card.prototype.invenomed = false;
Card.prototype.secondAttack = false;

Card.prototype.heal = function(value) {
  this.health += value;
  if (this.health > this.maxHealth) this.health = this.maxHealth;
};

module.exports = Card;
