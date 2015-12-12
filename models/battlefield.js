var Battlefield = function() {
  this.fields = {};
};

Battlefield.prototype.addPlayer = function(playerId) {
  this.fields[playerId] = {};
};

Battlefield.prototype.untap = function(playerId) {
  var cards = [];

  for (var cardId in this.fields[playerId]) {
    var card = this.fields[playerId][cardId];
    card.used = false;
    if (card.sick) {
      console.log('Unsick card', card.id, 'for player', playerId);
      card.sick = false;
    }
    cards.push({
      id: card.id,
      sick: card.sick,
      used: card.used
    });
  }
  return cards;
};

Battlefield.prototype.playCard = function(playerId, card) {
  this.fields[playerId][card.id] = card;
};

Battlefield.prototype.getCard = function(playerId, cardId) {
  return this.fields[playerId][cardId];
};

Battlefield.prototype.removeCard = function(playerId, cardId) {
  delete this.fields[playerId][cardId];
};

module.exports = Battlefield;
