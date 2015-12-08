var _ = require('underscore');
var Global = require('../global');
var Player = require('./player');
var Battlefield = require('./battlefield');

function Match(socket) {
  this.status = Global.MATCH_STATUS.Open;
  this.players = {};
  this.battlefield = new Battlefield();
  this.turnOrder = [];
  this.turnIndex = 0;

  // Generate
  this.id = '123120391280398102938';
  console.log(`Match ${this.id} created`);
  socket.emit('match-created', this.id);

  this.join(socket);
}

Match.prototype.join = function(socket) {
  // Get players list before adding a new player
  var playersList = [];
  this.iterate(function(key) {
    playersList.push(key);
  });

  this.players[socket.id] = new Player(socket);
  this.battlefield.addPlayer(socket.id);

  socket.emit('joined', {
    'id': socket.id,
    'others': playersList.length > 0 ? playersList : null
  });

  this.emitAllBut(socket.id, 'new-player', {
    'id': socket.id
  })
};

Match.prototype.start = function() {
  this.status = Global.MATCH_STATUS.Started;
  console.log('Match started');
  this.broadcast('match-started');

  this.turnOrder = Object.keys(this.players);
  this.turnOrder.shuffle();

  // Send hands to users
  for (var playerId in this.players) {
    var opponents = [];
    var opponentKeys = _.filter(Object.keys(this.players), function(k) {
      return (k !== playerId);
    });

    opponentKeys.forEach(function(opponentId) {
      console.log('opponentId', opponentId);
      opponents.push({
        'player': {
          'id': opponentId,
          'health': this.players[opponentId].health,
          'cards': this.players[opponentId].hand.length
        }
      });
    }, this);

    this.emit(playerId, 'player', {
      'player': {
        'id': playerId,
        'health': this.players[playerId].health
      }
    });
    this.emit(playerId, 'opponents', {
      'opponents': opponents
    });
    this.emit(playerId, 'hand', {
      'player': {
        'id': playerId,
        'hand': this.players[playerId].hand
      }
    });
  }
};

Match.prototype.turn = function() {
  var playerId = this.turnOrder[this.turnIndex];
  var newCard = this.players[playerId].startTurn();

  var cards = this.battlefield.untap(playerId);
  this.broadcast('battlefield', {
    player: {
      id: playerId
    },
    cards: cards ? cards : null
  });

  if (newCard) {
    console.log('New card with id ' + newCard.id +' for player ' + playerId +', hand length:', this.players[playerId].hand.length);
  }

  this.emit(playerId, 'turn', {
    'player': {
      'id': playerId,
      'totalMana': this.players[playerId].totalMana,
      'usedMana': this.players[playerId].usedMana,
      'card': newCard
    }
  });

  this.emitAllBut(playerId, 'wait', {
    'player': {
      'id': playerId,
      'totalMana': this.players[playerId].totalMana,
      'usedMana': this.players[playerId].usedMana,
      'new_card': !!newCard
    }
  });
};

Match.prototype.playCard = function(playerId, cardId) {
  if (!this.inTurn(playerId)) return this.emit(playerId, 'no-turn');

  var player = this.players[playerId],
      canPlayCard = player.canPlayCard(cardId);

  if (canPlayCard > 0) {
    var card = player.playCard(cardId);
    this.battlefield.playCard(playerId, card);
    console.log('Player', playerId, 'put card', cardId, 'into the battlefield');
    this.broadcast('played-card', {
      'player': {
        'id': playerId
      },
      'card': card,
      'totalMana': player.totalMana,
      'usedMana': player.usedMana
    });
  } else if (canPlayCard === Global.ERRORS.NO_MANA) {
    this.emit(playerId, 'no-mana');
  } else if (canPlayCard === Global.ERRORS.CARD_NOT_FOUND) {
    this.emit(playerId, 'card-not-found');
  }
};

Match.prototype.endTurn = function(playerId) {
  if (!this.inTurn(playerId)) return this.emit(playerId, 'no-turn');

  console.log('Player', playerId, 'ended turn');
  this.turnIndex += 1;
  if (this.turnIndex >= this.turnOrder.length) {
    this.turnIndex = 0;
  }
  console.log('New turn for player', this.turnOrder[this.turnIndex], this.turnIndex);
  this.turn();
};

// Emit event to socket associated to playerId
Match.prototype.emit = function(playerId, command, data) {
  this.players[playerId].socket.emit(command, data);
};

// Broadcast event to all players
Match.prototype.broadcast = function(command, data) {
  for (var id in this.players) {
    this.players[id].socket.emit(command, data);
  }
};

// Broadcast event to all players except the one indicated by playerId
Match.prototype.emitAllBut = function(playerId, command, data) {
  for (var id in this.players) {
    if (id !== playerId) {
      this.players[id].socket.emit(command, data);
    }
  }
};

// Iterates over the players and executes a callback passing key, value
Match.prototype.iterate = function(cb) {
  Object.keys(this.players).forEach(function(key) {
    cb(key, this.players[key]);
  }, this);
};

Match.prototype.inTurn = function(playerId) {
  return (playerId === this.turnOrder[this.turnIndex]);
};

module.exports = Match;
