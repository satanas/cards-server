var _ = require('underscore');
var Player = require('./player');

function Match(server, socket) {
  this.players = {};
  this.battlefield = {};
  this.turnOrder = [];
  this.turnIndex = 0;
  this.matchEnded = false;
  this.server = server;
  // Generate
  this.id = '123120391280398102938';
  console.log('Match ' + this.id + ' created');
  socket.emit('match-created', this.id);

  this.joinPlayer(socket);
}

Match.prototype.join = function(socket) {
  this.players[socket.id] = new Player(socket);
  this.battlefield[socket.id] = {};
  socket.emit('joined', {
    'player': {
      'id': socket.id,
      'health': this.players[socket.id].health
    }
  });
};

Match.prototype.start = function() {
  this.server.emit('ready');
  console.log('Ready!');
  this.turnOrder = Object.keys(this.players);
  this.turnOrder.shuffle();

  // Send hands to users
  Object.keys(this.players).forEach(function(key) {
    var opponentKeys = _.filter(Object.keys(this.players), function(k) {
      return (k !== key);
    });
    var opponents = [];
    opponentKeys.forEach(function(key) {
      opponents.push({
        'player': {
          'id': key,
          'health': this.players[key].health
        }
      });
    }, this);
    this.players[key].socket.emit('opponents', opponents);
    var hands = {
      you: {
        hand: this.players[key].hand
      }
    }
    opponents.forEach(function(o) {
      hands[o.player.id] = {
        count: this.players[o.player.id].hand.length
      }
    }, this);
    this.players[key].socket.emit('hands', hands);
  }, this);
};

Match.prototype.turn = function() {
  var newCard = players[turnOrder[turnIndex]].cardFromDeck();

  Object.keys(players).forEach(function(key) {
    if (key === turnOrder[turnIndex]) {
      // Unsick creatures from previous turn
      Object.keys(battlefield[key]).forEach(function(cardId) {
        var card = battlefield[key][cardId];
        card.used = false;
        if (card.sick) {
          card.sick = false;
          console.log('Unsick card', card.id, 'for player', key);
          server.emit('unsick', {
            player: {
              id: key
            },
            card: {
              id: card.id
            }
          });
        }
      });
      players[key].usedMana = 0;
      players[key].increaseMana();
      if (newCard) {
        console.log('New card with id ' + newCard.id +' for player ' + key +', hand length:', players[key].hand.length);
      }
      players[key].socket.emit('turn', {
        'mana': players[key].mana,
        'card': newCard
      });
    } else {
      players[key].socket.emit('wait', {
        'mana': players[key].mana,
        'card_for': newCard ? turnOrder[turnIndex] : null
      });
    }
  });
};

module.exports = Match;
