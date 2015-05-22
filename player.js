var _ = require('underscore');
var global = require('./global');
var Deck = require('./deck');

function Player(socket) {
  this.health = global.maxHealth;
  this.mana = 0;
  this.usedMana = 0;
  this.deck = new Deck();
  this.hand = this.deck.getHand();
  this.graveyard = [];
  this.socket = socket;
  this.id = socket.id;
  console.log('Created player for socket', socket.id);
};

Player.prototype.canDraw = function(cardId) {
  var card = _.find(this.hand, function(c) {
    return c.id === cardId;
  });
  return (this.usedMana + card.mana <= this.mana);
};

Player.prototype.drawCard = function(cardId) {
  var card = _.find(this.hand, function(c) {
    return c.id === cardId;
  });
  this.hand = _.filter(this.hand, function(c) {
    return c.id !== cardId;
  });
  this.usedMana += card.mana;
  return card;
};

Player.prototype.increaseMana = function() {
  this.mana += 1;
  if (this.mana > global.maxMana)
    this.mana = global.maxMana;
};

module.exports = Player;
