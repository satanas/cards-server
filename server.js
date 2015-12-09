require('./lib/mixins');

var http = require('http');
var _ = require('underscore');
var global = require('./global');
var Match = require('./models/match');
var Player = require('./models/player');


var port = process.argv[2] || 3000;
var app = http.createServer();

var players = {};
var battlefield = {};
var turnOrder = [];
var turnIndex = 0;
var matchEnded = false;
var matches = [];

var server = require('socket.io')(app);

function findMatch(socketId) {
  return matches[0];
}

server.on('connection', function(socket) {
  console.log(`Client ${socket.id} connecting`);

  socket.on('new-match', function() {
    // FIXME: Remove me
    matches = [];
    // ***************
    var match = new Match(socket);
    matches.push(match);
  });

  socket.on('join-match', function(matchId) {
    // Search for match
    var match = findMatch(socket.id);
    // FIXME: Validate on started matches
    match.join(socket);
    if (Object.keys(match.players).length > 1) {
      match.start();
      match.startTurn();
    }
  });

  socket.on('play-card', function(cardId) {
    var match = findMatch(socket.id);
    match.playCard(socket.id, cardId);
  });

  socket.on('attack', function(data) {
    var match = findMatch(socket.id);
    match.attack(socket.id, data);
  });

  socket.on('direct-attack', function(data) {
    if (!isPlayerInTurn(socket.id)) return socket.emit('no-turn');
    if (!isPlayer(data.defender.playerId)) return socket.emit('no-player');

    var attacker = battlefield[socket.id][data.attacker.cardId],
        defender = players[data.defender.playerId];

    if (!attacker || !defender) return socket.emit('card-not-found');
    if (attacker.sick) return socket.emit('card-sick');
    if (attacker.used) return socket.emit('card-used');

    console.log('Card', attacker.id, 'from player', socket.id, 'attacked player', defender.id, 'with', attacker.attack, 'pt(s) of damage');
    defender.health -= attacker.attack;
    attacker.used = true;

    server.emit('direct-damage', {
      'attacker': {
        'player': {
          'id': socket.id
        },
        'card': {
          'id': attacker.id
        },
        'damageDealt': attacker.attack,
        'damageReceived': 0,
        'health': attacker.health
      },
      'player': {
        'id': data.defender.playerId,
        'damageDealt': 0,
        'damageReceived': attacker.attack,
        'health': defender.health
      }
    });
    checkForVictory(defender);
  });

  socket.on('end-turn', function(data) {
    var match = findMatch(socket.id);
    match.endTurn(socket.id);
  });

  socket.on('disconnect', function(socket) {
    console.log('disconnected player', socket.player);
  });
});

app.listen(port, "0.0.0.0");
console.log('Listening on port', port);

function isPlayer(playerId) {
  return (Object.keys(players).indexOf(playerId) >= 0);
}

function isPlayerInTurn(playerId) {
  return (playerId === turnOrder[turnIndex]);
}

function checkForVictory(defender) {
  if (defender.health <= 0) {
    matchEnded = true;
    console.log('Player', defender.id, 'defeated');
    players[defender.id].socket.emit('lose');
    delete players[defender.id];

    if (Object.keys(players).length === 1) {
      var victoryPlayer = players[Object.keys(players)[0]];
      console.log('Player', victoryPlayer.id, 'won');
      players[victoryPlayer.id].socket.emit('won');
    } else {
      Object.keys(players).forEach(function(key) {
        players[key].emit('leader-defeated', defender.id);
      });
    }
  }
}

function performTurn() {
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
}

