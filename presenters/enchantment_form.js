var Target = require('../models/target');
var Event = require('../models/event');
var Modification = require('../models/mod');

var Presenter = function() {
  var self = this;
  // Target information
  Target.Condition.find().select({_id: 0}).exec().then(function(data) {
    self.targetConditions = data;
    console.log('Loaded target conditions');
  });
  Target.Select.find().select({_id: 0}).exec().then(function(data) {
    self.targetSelects = data;
    console.log('Loaded target selects');
  });
  Target.Type.find().select({_id: 0}).exec().then(function(data) {
    self.targetTypes = data;
    console.log('Loaded target types');
  });
  Target.Band.find().select({_id: 0}).exec().then(function(data) {
    self.targetBands = data;
    console.log('Loaded target bands');
  });

  // Event information
  Event.find().select({_id: 0}).exec().then(function(data) {
    self.events = data;
    console.log('Loaded events');
  });

  // Modifications information
  Modification.Spell.find().select({_id: 0}).exec().then(function(data) {
    self.modSpells = data;
    console.log('Loaded mod spells');
  });
  Modification.Attribute.find().select({_id: 0}).exec().then(function(data) {
    self.modAttributes = data;
    console.log('Loaded mod attributes');
  });
  Modification.Operation.find().select({_id: 0}).exec().then(function(data) {
    self.modOperations = data;
    console.log('Loaded mod operations');
  });
  Modification.Ability.find().select({_id: 0}).exec().then(function(data) {
    self.modAbilities = data;
    console.log('Loaded mod abilities');
  });
  Modification.Multiplier.find().select({_id: 0}).exec().then(function(data) {
    self.modMultipliers = data;
    console.log('Loaded mod multipliers');
  });
};

Presenter.prototype.render = function() {
  form = {};
  form.target = {
    conditions: this.targetConditions,
    selects: this.targetSelects,
    types: this.targetTypes,
    bands: this.targetBands
  };
  form.events = this.events;
  form.mod = {
    spells: this.modSpells,
    attributes: this.modAttributes,
    operations: this.modOperations,
    abilities: this.modAbilities,
    multipliers: this.modMultipliers
  };

  return form;
};

module.exports = Presenter;
