(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Validator = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Validator = function() {
  // FIXME: Create only local variables for errors and always return an array with errors (or empty)
  this.errors = [];
  this.modificationErrorId = 'modification-error';
  this.enchantmentErrorId = 'enchantment-error';
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

  if (equal)
    this.errors.push({field: this.modificationErrorId, message: 'you can not add duplicated spells'});

  return this.errors;
};

var EnchantmentValidator = function() {
  Validator.call(this);
};

EnchantmentValidator.prototype = Object.create(Validator.prototype);
EnchantmentValidator.prototype.constructor = EnchantmentValidator;

EnchantmentValidator.prototype.validate = function(enchantment) {
  this.errors = [];

  console.log('enchantment', enchantment);
  if (enchantment.description === '')
    this.errors.push({field: 'description', message: 'description can not be empty'});

  if (enchantment.event === '')
    this.errors.push({field: 'event', message: 'event can not be empty'});

  if (enchantment.target.select === 'yes')
    this._mustBePresent(enchantment.target, ['type', 'quantity']);

  if (enchantment.mods.length === 0)
    this.errors.push({field: this.enchantmentErrorId, message: 'you can not add enchantment without modifications'});

  var mods = enchantment.mods.slice(0);
  console.log('comparing enchantment modifications', mods);
  while (mods.length > 1) {
    var mod = mods.splice(0, 1);

    for (var i=0; i < mods.length; i++) {
      var err = new ModificationValidator().compare(mods[i], mod);
      if (err.length > 0) {
        this.errors = _.union(this.errors, err);
        break;
      }
    }
  }
  return this.errors;
};

module.exports = {
  Modifications: ModificationValidator,
  Enchantments: EnchantmentValidator
};

},{}]},{},[1])(1)
});