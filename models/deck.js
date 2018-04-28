var Card = require('../models/card');

function Deck(playerId, cardStorage) {
  this.playerId = playerId;
  this.cards = [];
  cardStorage.forEach(function(c) {
    this.cards.push(new Card(c));
  }, this);
  this.shuffle();
};

Deck.prototype.shuffle = function() {
  this.cards.shuffle();
};

Deck.prototype.getCard = function() {
  var card = this.cards.pop() || null;
  if (card) {
    card.playerId = this.playerId;
  }
  return card;
};

Deck.prototype.getHand = function() {
  var hand = [];
  for (var i = 0; i < 3; i++) {
    var card = this.cards.pop();
    card.playerId = this.playerId;
    hand.push(card);
  }
  console.log('hand', hand);
  return hand;
};

Deck.prototype.constructor = Deck;

module.exports = Deck;
