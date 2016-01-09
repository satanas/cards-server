'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: String,
  value: String,
});

var Target = {
  Select: mongoose.model('target_selects', schema),
  Condition: mongoose.model('target_conditions', schema),
  Type: mongoose.model('target_type', schema),
  Band: mongoose.model('target_bands', schema),
};

module.exports = Target;
