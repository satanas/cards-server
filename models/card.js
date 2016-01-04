'use strict';
var _ = require('underscore');

var Card = function(model) {
  // Status properties
  this.sick = true;
  this.used = false;
  this.played = false;
  this.invenomed = false;
  this.hidden = false;

  this.spells = [];
  //this.flying = flying || false; // Can only be blocked by flying
  //this.shadow = shadow || false;
  //berserker: attacks twice
  //unholy: can't be target of spells or abilities
  //provoke: enemy can't attack other creatures
  //stealth: can't be targeted until it attacks

  _.extend(this, model.toJSON());
};

Card.prototype.constructor = Card;

Card.prototype.heal = function(value) {
  this.health += value;
  if (this.health > this.maxHealth) this.health = this.maxHealth;
};

module.exports = Card;
