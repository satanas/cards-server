var _ = require('underscore');
var Global = require('../global');
var Target = require('../models/target');

var Presenter = function() {
  var self = this;
  var query = Target.Conditions.find().select({_id: 0}).exec();
  query.then(function(data) {
    self.targetConditions = data;
    console.log('Loaded target conditions');
  });
  query = Target.Selects.find().select({_id: 0}).exec();
  query.then(function(data) {
    self.targetSelects = data;
    console.log('Loaded target selects');
  });
  query = Target.Types.find().select({_id: 0}).exec();
  query.then(function(data) {
    self.targetTypes = data;
    console.log('Loaded target types');
  });
  query = Target.Bands.find().select({_id: 0}).exec();
  query.then(function(data) {
    self.targetBands = data;
    console.log('Loaded target bands');
  });
};

Presenter.prototype.render = function(card) {
  console.log('conditions', this.targetConditions);
  card._id = null;
  card.types = [
    {
      name: "Creature",
      value: 2,
      selected: true
    },
    {
      name: "Spell",
      value: 1
    }
  ];

  card.target = {
    conditions: this.targetConditions,
    selects: this.targetSelects,
    types: this.targetTypes,
    bands: this.targetBands
  };
  card.abilities = [];

  Global.ABILITIES.forEach(function(key) {
    values = _.map([true, false], function(v) {
      return {
        name: v.toString(),
        value: v,
        selected: (card[key] === v) || false
      };
    });

    card.abilities.push({
      name: key,
      values: values
    });
  });

  return card;
};

module.exports = Presenter;
