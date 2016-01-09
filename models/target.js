'use strict';

var mongoose = require('mongoose');

var schema = mongoose.Schema({
  name: String,
  value: String,
});

var Target = {
  Selects: mongoose.model('target_selects', schema),
  Conditions: mongoose.model('target_conditions', schema),
  Types: mongoose.model('target_type', schema),
  Bands: mongoose.model('target_bands', schema),
};

module.exports = Target;
