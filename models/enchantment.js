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

module.exports = Enchantment;
