'use strict';

var mongoose = require('mongoose');

var cardSchema = mongoose.Schema({
  id: String,
  type: {type: Number},
  attack: Number,
  health: Number,
  maxHealth: Number,
  name: String,
  image: String,
  mana: Number,
  description: String,
  enchantments: mongoose.Schema.Types.Mixed,
  flavorText: {type: String, default: ''},
  firstStrike: {type: Boolean, default: false},
  rush: {type: Boolean, default: false},
  overwhelm: {type: Boolean, default: false},
  deathtouch: {type: Boolean, default: false},
  curse: {type: Boolean, default: false},
  venom: {type: Boolean, default: false},
  transfusion: {type: Boolean, default: false},
  vampirism: {type: Boolean, default: false},
  berserker: {type: Boolean, default: false},
});

module.exports = mongoose.model('Card', cardSchema);
