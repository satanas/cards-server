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
  flavorText: String,
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

/*
var Card = function(id, type, attack, health, name, image, mana, description, flavorText, abilities) {
  this.id = id;
  this.type = type;
  this.attack = attack;
  this.health = health;
  this.maxHealth = health;
  this.name = name;
  this.image = image;
  this.mana = mana;
  this.description = description;
  this.flavorText = flavorText;

  // Abilities:
  abilities = abilities || {};
  // Attack first, can survive if the other is killed
  this.firstStrike = abilities.firstStrike || false;
  // Attack when played
  this.rush = abilities.rush || false;
  // Inflicts the non-blocked damage to the player (only when attacking)
  this.overwhelm = abilities.overwhelm || false;
  // If creature with deathtouch dies, the attacking creature also dies
  this.deathtouch = abilities.deathtouch || false;
  // Invenom any creature that deals damage. Invenomed creature lose 1 health every turn until it dies
  this.venom = abilities.venom || false;
  // Give 1 health to player for each killed creature
  this.transfusion = abilities.transfusion || false;
  // Recovers 1 health to the card for each killed creature
  this.vampirism = abilities.vampirism || false;
  // Can attack twice in the same turn
  this.berserker = abilities.berserker || false;

  // Props
  this.sick = true;
  this.used = false;
  this.played = false;
  this.invenomed = false;
  this.secondAttack = false;

  this.attrs = [];
  //this.flying = flying || false; // Can only be blocked by flying
  //this.shadow = shadow || false;
  //berserker: attacks twice
  //unholy: can't be target of spells or abilities
  //provoke: enemy can't attack other creatures
  //stealth: can't be targeted until it attacks
};
*/

//Card.prototype.constructor = Card;
//
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
