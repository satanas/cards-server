var Card = require('./card');
var Global = require('../global');
var mongoose = require('mongoose');

var Deck = function (playerId, cardStorage) {
  this.playerId = playerId;
  this.cards = cardStorage.slice(0);
  this.shuffle();
};

Deck.prototype.shuffle = function() {
  this.cards.shuffle();
};

Deck.prototype.getCard = function() {
  var card = this.cards.pop() || null;
  if (card) {
    //card.playerId = this.playerId;
    card.set('playerId', this.playerId);
  }
  return card;
};

Deck.prototype.getHand = function() {
  var hand = [];
  for (var i = 0; i < 3; i++) {
    var card = this.cards.pop();
    //card.playerId = this.playerId;
    card.set('playerId', this.playerId);
    hand.push(card);
  }
  console.log('hand', hand);
  return hand;
};

module.exports = Deck;
