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
    // Unsick
    if (card.sick) {
      card.sick = false;
      console.log('Unsick card', card.id, 'for player', playerId);
    }

    var damage = {
      'venom': 0
    };
    // Venom
    if (card.invenomed) {
      card.health -= 1;
      damage.venom = 1;

      if (card.health <= 0) {
        console.log('Card', card.id, 'for player', playerId, 'dies due to venom');
        delete this.removeCard(playerId, card.id);
      } else {
        console.log('Card', card.id, 'for player', playerId, 'loses 1 health due to venom');
      }
    }

    cards.push({
      id: card.id,
      sick: card.sick,
      used: card.used,
      health: card.health,
      damage: damage
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
