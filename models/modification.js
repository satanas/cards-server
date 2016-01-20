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

  var mustBePresent = function(obj, attr) {
    if (attr instanceof Array) {
      attr.forEach(function(e) {
        if (obj[e] === '') errors.push({field: e, message: `${e} can not be empty`});
      });
    } else {
      if (obj[attr] === '') errors.push({field: attr, message: `${attr} can not be empty`});
    }
  };
  var mustBeAbsent = function(obj, attr) {
    if (attr instanceof Array) {
      attr.forEach(function(e) {
        if (obj[e] !== '') errors.push({field: e, message: `spell '${obj.spell}' can not have ${e}`});
      });
    } else {
      if (obj[attr] !== '') errors.push({field: attr, message: `spell '${obj.spell}' can not have ${attr}`});
    }
  };

  // If you're adding a modification, it has to have a spell
  if (mod.spell === '') errors.push({field: 'spell', message: 'spell can not be empty'});

  if (mod.spell === 'attribute') {
    mustBePresent(mod, ['attribute', 'operation', 'value']);
    mustBeAbsent(mod, 'ability');
  }
  if (mod.spell === 'ability') {
    mustBePresent(mod, 'ability');
    mustBeAbsent(mod, ['attribute', 'operation', 'multiplier', 'value']);
  }
  if (mod.spell === 'draw') {
    mustBePresent(mod, 'value');
    mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier']);
  }
  if (mod.spell === 'damage') {
    mustBePresent(mod, 'value');
    mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier']);
  }
  if (mod.spell === 'summon') {
    mustBePresent(mod, 'value');
    mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier']);
  }
  return errors;
};

module.exports = Modification;
