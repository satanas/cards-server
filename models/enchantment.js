'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  description: String,
  event: String,
  target: {
    select: String,
    type: String,
    condition: String,
    band: String,
    class: String,
    quantity: String
  },
  mods: Object
});

var Enchantment = mongoose.model('enchantments', schema);

Enchantment.validate = function(enchantment) {
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

  if (enchantment.description === '') errors.push({field: 'description', message: 'description can not be empty'});
  if (enchantment.event === '') errors.push({field: 'event', message: 'event can not be empty'});

  if (enchantment.target.select === 'yes') {
    mustBePresent(enchantment.target, ['type', 'quantity']);
  }

  return errors;
};

module.exports = Enchantment;
