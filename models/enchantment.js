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

Enchantment.validate = function(enc) {
  var errors = [];

  if (enc.description === '') errors.push({field: 'description', message: 'description can not be empty'});
  if (enc.event === '') errors.push({field: 'event', message: 'event can not be empty'});

  return errors;
};

module.exports = Enchantment;
