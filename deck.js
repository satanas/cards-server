var Card = require('./card');
var global = require('./global');
var random = require('./random');

cardStorage = [
  new Card(1, global.cardTypes.CREATURE, 1, 1, 'Bla Monster', 'image.jpg', 1, 'Description'),
  new Card(2, global.cardTypes.CREATURE, 1, 2, 'Ble Monster', 'image.jpg', 1, 'Description'),
  new Card(3, global.cardTypes.CREATURE, 2, 2, 'Bli Monster', 'image.jpg', 1, 'Description'),
  new Card(4, global.cardTypes.CREATURE, 4, 4, 'Blo Monster', 'image.jpg', 2, 'Description'),
  new Card(5, global.cardTypes.CREATURE, 1, 4, 'Blu Monster', 'image.jpg', 2, 'Description'),
  new Card(6, global.cardTypes.CREATURE, 1, 1, 'Kla Monster', 'image.jpg', 3, 'Description'),
  new Card(7, global.cardTypes.CREATURE, 1, 2, 'Kle Monster', 'image.jpg', 3, 'Description'),
  new Card(8, global.cardTypes.CREATURE, 2, 2, 'Kli Monster', 'image.jpg', 4, 'Description'),
  new Card(9, global.cardTypes.CREATURE, 4, 4, 'Klo Monster', 'image.jpg', 4, 'Description'),
  new Card(10, global.cardTypes.CREATURE, 1, 4, 'Klu Monster', 'image.jpg', 5, 'Description'),
  new Card(11, global.cardTypes.CREATURE, 2, 3, 'Fla Monster', 'image.jpg', 5, 'Description'),
];

function Deck() {
  // Read the cards storage and create a 60 cards deck
  this.cards = cardStorage.slice(0);
  this.shuffle();
};

// http://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm
Deck.prototype.shuffle = function() {
  random.shuffle(this.cards);
};

Deck.prototype.getCard = function() {
  return this.cards.pop();
};

Deck.prototype.getHand = function() {
  var hand = [];
  for (var i = 0; i < 4; i++) {
    hand.push(this.cards.pop());
  }
  return hand;
};

module.exports = Deck;
