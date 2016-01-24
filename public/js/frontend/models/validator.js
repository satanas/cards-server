(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Validator = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Validator = function() {
  console.log('see you later, alligatori kakkakakakaka');
  this.errors = [];
};

Validator.prototype.constructor = Validator;

Validator.prototype.mustBePresent = function(obj, attr) {
  if (attr instanceof Array) {
    attr.forEach(function(e) {
      if (obj[e] === '') this.errors.push({field: e, message: e + " can not be empty"});
    }.bind(this));
  } else {
    if (obj[attr] === '') this.errors.push({field: attr, message: attr + " can not be empty"});
  }
};

Validator.prototype.mustBeAbsent = function(obj, attr) {
  if (attr instanceof Array) {
    attr.forEach(function(e) {
      if (obj[e] !== '') this.errors.push({field: e, message: "spell '" + obj.spell + "' can not have " + e});
    }.bind(this));
  } else {
    if (obj[attr] !== '') this.errors.push({field: attr, message: "spell '" + obj.spell + "' can not have " + attr});
  }
};

Validator.prototype.validateModifications = function(mod) {
  this.errors = [];
  // If you're adding a modification, it has to have a spell
  if (mod.spell === '') this.errors.push({field: 'spell', message: 'spell can not be empty'});

  if (mod.spell === 'attribute') {
    this.mustBePresent(mod, ['attribute', 'operation', 'value']);
    this.mustBeAbsent(mod, 'ability');
  }
  if (mod.spell === 'ability') {
    this.mustBePresent(mod, 'ability');
    this.mustBeAbsent(mod, ['attribute', 'operation', 'multiplier', 'value']);
  }
  if (mod.spell === 'draw' || mod.spell === 'damage' || mod.spell === 'summon' || mod.spell === 'transform' ||
     mod.spell === 'necromancy' || mod.spell === 'player_health' || mod.spell === 'protect_player' ||
     mod.spell === 'mana_cost') {
    this.mustBePresent(mod, 'value');
    this.mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier']);
  }
  if (mod.spell === 'protect_card' || mod.spell === 'disenchant' || mod.spell === 'return' ||
      mod.spell === 'kill_target' || mod.spell === 'freeze') {
    this.mustBeAbsent(mod, ['attribute', 'operation', 'ability', 'multiplier', 'value']);
  }
  return this.errors;
};

module.exports = Validator;

},{}]},{},[1])(1)
});