'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: String,
  value: String,
});

var Modification = {
  Spell: mongoose.model('mod_spells', schema),
  Attribute: mongoose.model('mod_attributes', schema),
  Operation: mongoose.model('mod_operations', schema),
  Ability: mongoose.model('mod_abilities', schema),
  Multiplier: mongoose.model('mod_multipliers', schema),
};

Modification.validate = function(mod) {
  var errors = [];

  if (mod.spell === '') errors.push({field: 'spell', message: 'spell can not be empty'});
  if (mod.spell === 'attribute') {
    if (mod.attribute === '') errors.push({field: 'attribute', message: 'attribute can not be empty'});
    if (mod.operation === '') errors.push({field: 'operation', message: 'operation can not be empty'});
  }
  if (mod.spell === 'ability') {
    if (mod.ability === '') errors.push({field: 'ability', message: 'ability can not be empty'});
  }
  return errors;
};

module.exports = Modification;
