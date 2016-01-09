'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: String,
  value: String,
});

var Mod = {
  Spell: mongoose.model('mod_spells', schema),
  Attribute: mongoose.model('mod_attributes', schema),
  Operation: mongoose.model('mod_operations', schema),
  Ability: mongoose.model('mod_abilities', schema),
  Multiplier: mongoose.model('mod_multipliers', schema),
};

module.exports = Mod;
