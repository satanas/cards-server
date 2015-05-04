var Deck = require('./deck');

function Player(client) {
  this.health = 20;
  this.mana = 0;
  this.deck = new Deck();
  this.hand = this.deck.getHand();
  this.graveyard = [];
  this.client = client;
  console.log('Created player for client', client.id);
};

module.exports = Player;
