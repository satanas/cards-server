var _ = require('underscore');
var Global = require('../global');
var Deck = require('./deck');

function Player(socket, cardStorage) {
  this.id = socket.id;
  this.health = Global.MAX_HEALTH;
  this.totalMana = 0;
  this.usedMana = 0;
  this.deck = new Deck(this.id, cardStorage);
  this.hand = this.deck.getHand();
  this.graveyard = [];
  this.socket = socket;
  console.log('Created player for socket', socket.id);
};

Player.prototype.constructor = Player;

Player.prototype.canPlayCard = function(cardId) {
  var card = _.find(this.hand, function(c) {
    return c.id === cardId;
  });
  if (card === undefined) {
    return Global.ERRORS.CARD_NOT_FOUND;
  } else if (this.usedMana + card.mana > this.totalMana) {
    return Global.ERRORS.NO_MANA;
  }
  return 1;
};

Player.prototype.playCard = function(cardId) {
  var card = _.find(this.hand, function(c) {
    return c.id === cardId;
  });
  this.hand = _.filter(this.hand, function(c) {
    return c.id !== cardId;
  });
  card.played = true;
  this.usedMana += card.mana;
  return card;
};

Player.prototype.cardFromDeck = function() {
  var card = this.deck.getCard();
  if (card) {
    this.hand.push(card);
  }
  return card;
};

Player.prototype.increaseMana = function() {
  this.totalMana += 1;
  if (this.totalMana > Global.MAX_MANA)
    this.totalMana = Global.MAX_MANA;
};

Player.prototype.startTurn = function() {
  this.usedMana = 0;
  this.increaseMana();
  return this.cardFromDeck();
};

Player.prototype.heal = function(value) {
  this.health += value;
  if (this.health > Global.MAX_HEALTH) this.health = Global.MAX_HEALTH;
};

module.exports = Player;
