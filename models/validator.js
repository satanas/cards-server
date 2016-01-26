var Validator = function() {
  this.errors = [];
  this.genericErrorId = 'generic-error';
};

Validator.prototype.constructor = Validator;

Validator.prototype._mustBePresent = function(obj, attr) {
  if (attr instanceof Array) {
    attr.forEach(function(e) {
      if (obj[e] === '') this.errors.push({field: e, message: e + " can not be empty"});
    }.bind(this));
  } else {
    if (obj[attr] === '') this.errors.push({field: attr, message: attr + " can not be empty"});
  }
};

Validator.prototype._mustBeAbsent = function(obj, attr) {
  if (attr instanceof Array) {
    attr.forEach(function(e) {
      if (obj[e] !== '') this.errors.push({field: e, message: "spell '" + obj.spell + "' can not have " + e});
    }.bind(this));
  } else {
    if (obj[attr] !== '') this.errors.push({field: attr, message: "spell '" + obj.spell + "' can not have " + attr});
  }
};

var ModificationValidator = function() {
  Validator.call(this);
};

ModificationValidator.prototype = Object.create(Validator.prototype);
ModificationValidator.prototype.constructor = ModificationValidator;

ModificationValidator.prototype.validate = function(mod) {
  this.errors = [];

  // If you're adding a modification, it has to have a spell
  if (mod.spell === '') this.errors.push({field: 'spell', message: 'spell can not be empty'});

  if (mod.spell === 'attribute') {
    this._mustBePresent(mod, ['attribute', 'operation', 'value']);
    this._mustBeAbsent(mod, 'ability');
  }
  if (mod.spell === 'ability') {
    this._mustBePresent(mod, 'ability');
    this._mustBeAbsent(mod, ['attribute', 'operation', 'multiplier', 'value']);
  }
  if (mod.spell === 'draw' || mod.spell === 'damage' || mod.spell === 'summon' || mod.spell === 'transform' ||
     mod.spell === 'necromancy' || mod.spell === 'player_health' || mod.spell === 'protect_player' ||
     mod.spell === 'mana_cost') {
    this._mustBePresent(mod, 'value');
    this._mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier']);
  }
  if (mod.spell === 'protect_card' || mod.spell === 'disenchant' || mod.spell === 'return' ||
      mod.spell === 'kill_target' || mod.spell === 'freeze') {
    this._mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier', 'value']);
  }

  return this.errors;
};

ModificationValidator.prototype.compare = function(obj1, obj2) {
  this.errors = [];
  if (obj1.spell === 'draw' && obj1.spell === obj2.spell) return true;
  if (obj1.spell === 'damage' && obj1.spell === obj2.spell) return true;
  if (obj1.spell === 'transform' && obj1.spell === obj2.spell) return true;
  if (obj1.spell === 'protect_card' && obj1.spell === obj2.spell) return true;
  if (obj1.spell === '' && obj1.spell === obj2.spell) return true;

  var equal = true;
  for (var attr in obj1) {
    equal = equal && obj2[attr] === obj1[attr];
  }
  if (equal) {
    this.errors.push({field: this.genericErrorId, message: 'you can not add duplicated spells'});
  }
  return this.errors;
};

module.exports = {
  Modifications: ModificationValidator,
  Enchantments: null
};
