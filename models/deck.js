var Card = require('./card');
var Global = require('../global');
var mongoose = require('mongoose');

var Deck = function(playerId) {
  // Read the cards storage and create a 60 cards deck
  cardStorage = [
    new Card(1, Global.cardTypes.CREATURE, 1, 1, 'Bla Monster', 'image.png', 1, ''),
    new Card(2, Global.cardTypes.CREATURE, 1, 2, 'Ble Monster', 'image.png', 1, 'Description', null, {firstStrike: true}),
    new Card(3, Global.cardTypes.CREATURE, 2, 2, 'Bli Monster', 'image.png', 1, 'Description', 'Until one of us die', {berserker: true}),
    new Card(4, Global.cardTypes.CREATURE, 4, 4, 'Blo Monster', 'cute-horse.png', 2, ''),
    new Card(5, Global.cardTypes.CREATURE, 1, 4, 'Blu Monster', 'demon-horse.png', 2, 'Description', 'Your blood makes me stronger', {vampirism: true}),
    new Card(6, Global.cardTypes.CREATURE, 1, 1, 'Kla Monster', 'image.png', 3, 'Description', null, {firstStrike: true}),
    new Card(7, Global.cardTypes.CREATURE, 1, 2, 'Klev Monster', 'image.png', 3, 'Description', 'Worse than one venom? Two venoms', {venom: true, berserker: true}),
    new Card(8, Global.cardTypes.CREATURE, 2, 2, 'Kli Monster', 'image.png', 4, ''),
    new Card(9, Global.cardTypes.CREATURE, 4, 4, 'Klo Monster', 'image.png', 4, 'Description'),
    new Card(10, Global.cardTypes.CREATURE, 1, 4, 'Klu Monster', 'image.png', 5, 'Description', 'Give me your blood to heal my master', {transfusion: true}),
    new Card(11, Global.cardTypes.CREATURE, 2, 3, 'Fla Monster', 'image.png', 5, 'Description', null, {vampirism: true}),
    new Card(12, Global.cardTypes.CREATURE, 1, 1, 'Hurried Monster', 'fire-woman.png', 2, 'Description', 'I\'m in a hurry', {rush: true}),
    new Card(13, Global.cardTypes.CREATURE, 3, 2, 'Powerful Lad', 'warrior.png', 3, 'Description', 'Crushing fools', {overwhelm: true}),
    new Card(14, Global.cardTypes.CREATURE, 1, 1, 'Spearman', 'image.png', 2, 'Description', null, {firstStrike: true}),
    new Card(15, Global.cardTypes.CREATURE, 2, 2, 'Master Sword', 'image.png', 3, 'Description', null, {firstStrike: true}),
    new Card(16, Global.cardTypes.CREATURE, 1, 1, 'Damned', 'image.png', 2, 'Description', 'Come with me, to the other world', {deathtouch: true}),
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
