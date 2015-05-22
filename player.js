var _ = require('underscore');
var Deck = require('./deck');

function Player(socket) {
  this.health = 20;
  this.mana = 0;
  this.deck = new Deck();
  this.hand = this.deck.getHand();
  this.graveyard = [];
  this.socket = socket;
  this.id = socket.id;
  console.log('Created player for socket', socket.id);
};

Player.prototype.drawCard = function(cardId) {
  var card = _.find(this.hand, function(c) {
    return c.id === cardId;
  });
  this.hand = _.filter(this.hand, function(c) {
    return c.id !== cardId;
  });
  return card;
};

module.exports = Player;
