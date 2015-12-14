var Card = require('./card');
var global = require('../global');

var Deck = function(playerId) {
  // Read the cards storage and create a 60 cards deck
  cardStorage = [
    new Card(1, global.cardTypes.CREATURE, 1, 1, 'Bla Monster', 'image.jpg', 1, 'Description'),
    new Card(2, global.cardTypes.CREATURE, 1, 2, 'Ble Monster', 'image.jpg', 1, 'Description'),
    new Card(3, global.cardTypes.CREATURE, 2, 2, 'Bli Monster', 'image.jpg', 1, 'Description'),
    new Card(4, global.cardTypes.CREATURE, 4, 4, 'Blo Monster', 'image.jpg', 2, 'Description'),
    new Card(5, global.cardTypes.CREATURE, 1, 4, 'Blu Monster', 'image.jpg', 2, 'Description'),
    new Card(6, global.cardTypes.CREATURE, 1, 1, 'Kla Monster', 'image.jpg', 3, 'Description'),
    new Card(7, global.cardTypes.CREATURE, 1, 2, 'Klev Monster', 'image.jpg', 3, 'Description', {venom: true}),
    new Card(8, global.cardTypes.CREATURE, 2, 2, 'Kli Monster', 'image.jpg', 4, 'Description'),
    new Card(9, global.cardTypes.CREATURE, 4, 4, 'Klo Monster', 'image.jpg', 4, 'Description'),
    new Card(10, global.cardTypes.CREATURE, 1, 4, 'Klu Monster', 'image.jpg', 5, 'Description'),
    new Card(11, global.cardTypes.CREATURE, 2, 3, 'Fla Monster', 'image.jpg', 5, 'Description'),
    new Card(12, global.cardTypes.CREATURE, 1, 1, 'Hurried Monster', 'image.jpg', 2, 'Description', {rush: true}),
    new Card(13, global.cardTypes.CREATURE, 3, 2, 'Powerful Lad', 'image.jpg', 3, 'Description', {overwhelm: true}),
    new Card(14, global.cardTypes.CREATURE, 1, 1, 'Spearman', 'image.jpg', 2, 'Description', {firstStrike: true}),
    new Card(15, global.cardTypes.CREATURE, 2, 2, 'Master Sword', 'image.jpg', 3, 'Description', {firstStrike: true}),
    new Card(16, global.cardTypes.CREATURE, 1, 1, 'Damned', 'image.jpg', 2, 'Description', {deathtouch: true}),
  ];
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
  return hand;
};

module.exports = Deck;
