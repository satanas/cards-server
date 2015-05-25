var http = require('http');
var _ = require('underscore');
var random = require('./random');
var global = require('./global');
var Player = require('./player');

var port = process.argv[2] || 3000;
var app = http.createServer();

var players = {};
var battlefield = {};
var turnOrder = [];
var turnIndex = 0;

var server = require('socket.io')(app);
server.on('connection', function(socket) {
  if (Object.keys(players).length === 0) {
    players[socket.id] = new Player(socket);
    battlefield[socket.id] = {};
    socket.emit('joined', 'Waiting for opponent to start');
  } else if (Object.keys(players).length === 1) {
    players[socket.id] = new Player(socket);
    battlefield[socket.id] = {};
    socket.emit('joined', 'Ready to start');
    server.emit('ready');
    console.log('Ready!');
    turnOrder = Object.keys(players);
    random.shuffle(turnOrder);

    // Send hands to users
    Object.keys(players).forEach(function(key) {
      players[key].socket.emit('hand', players[key].hand);
      if (key === turnOrder[turnIndex]) {
        console.log('Player', key, 'goes first');
        players[key].mana = 1;
        players[key].socket.emit('turn', players[key].mana);
      } else {
        players[key].socket.emit('wait', players[key].mana);
      }
    });
  } else {
    socket.emit('rejected', 'Battle started');
    console.log('Connection refused, battle started');
  }

  socket.on('draw', function(cardId) {
    if (!isInTurn(socket.id)) return socket.emit('no-turn');

    var player = players[socket.id];
    var canDraw = players[socket.id].canDraw(cardId);
    if (canDraw == true) {
      var card = players[socket.id].drawCard(cardId);
      battlefield[socket.id][card.id] = card;
      console.log('Player', socket.id, 'drawed card', cardId, 'to battlefield');
      server.emit('drawed-card', {
        'player': socket.id,
        'card': card,
        'mana': players[socket.id].mana,
        'usedMana': players[socket.id].usedMana
      });
    } else {
      if (canDraw === global.errors.NO_MANA) {
        socket.emit('no-mana');
      } else if (canDraw === global.errors.CARD_NOT_FOUND) {
        socket.emit('card-not-found');
      }
    }
  });

  socket.on('attack', function(data) {
    if (!isInTurn(socket.id)) return socket.emit('no-turn');

    var attacker = battlefield[socket.id][data.attacker.cardId],
        defender = battlefield[data.defender.playerId][data.defender.cardId];

    if (attacker && defender) {
      if (!attacker.sick) {
        console.log('Battle between card', attacker.id, '(from player', socket.id, ') and card', defender.id, '(from player', data.defender.playerId, ')');
        defender.health -= attacker.attack;
        attacker.health -= defender.attack;
        if (attacker.health <= 0) {
          console.log('Card', attacker.id, 'from player', socket.id, 'died');
          delete battlefield[socket.id][data.attacker.cardId];
        }
        if (defender.health <= 0) {
          console.log('Card', defender.id, 'from player', data.defender.playerId, 'died');
          delete battlefield[data.defender.playerId][data.defender.cardId];
        }
        server.emit('battle', {
          'attacker': {
            'playerId': socket.id,
            'cardId': attacker.id,
            'damageDealt': attacker.attack,
            'damageReceive': defender.attack,
            'health': attacker.health
          },
          'defender': {
            'playerId': data.defender.playerId,
            'cardId': defender.id,
            'damageDealt': defender.attack,
            'damageReceive': attacker.attack,
            'health': defender.health
          }
        });
      } else {
        socket.emit('card-sick');
      }
    } else {
      socket.emit('card-not-found');
    }
  });

  socket.on('attack-leader', function(data) {
    if (!isInTurn(socket.id)) return socket.emit('no-turn');

    var attacker = battlefield[socket.id][data.attacker.cardId],
        defender = players[data.defender.playerId];

    if (attacker && defender) {
      if (!attacker.sick) {
        console.log('Card', attacker.id, '(from player', socket.id, ') attacking player', defender.id);
        defender.health -= attacker.attack;
        server.emit('direct-attack', {
          'attacker': {
            'playerId': socket.id,
            'cardId': attacker.id,
            'damageDealt': attacker.attack,
            'damageReceive': 0,
            'health': attacker.health
          },
          'player': {
            'id': data.defender.playerId,
            'damageDealt': 0,
            'damageReceive': attacker.attack,
            'health': defender.health
          }
        });
        if (defender.health <= 0) {
          console.log('Leader', defender.id, 'defeated');
          console.log(players[defender.id]);
          players[defender.id].socket.emit('lose');
          delete players[defender.id];

          console.log('players', Object.keys(players).length);
          if (Object.keys(players).length === 1) {
            console.log('won', players[Object.keys(players)[0]]);
            players[Object.keys(players)[0]].socket.emit('won');
          } else {
            Object.keys(players).forEach(function(key) {
              console.log('leader.defeate', players[key]);
              players[key].emit('leader-defeated', defender.id);
            });
          }
        }
      } else {
        socket.emit('card-sick');
      }
    } else {
      socket.emit('invalid-operation');
    }

  });

  socket.on('end-turn', function(data) {
    if (!isInTurn(socket.id)) return socket.emit('no-turn');

    console.log('Player', socket.id, 'ended turn');
    turnIndex += 1;
    if (turnIndex >= turnOrder.length) {
      turnIndex = 0;
    }
    console.log('New turn for player', turnOrder[turnIndex], turnIndex);
    Object.keys(players).forEach(function(key) {
      if (key === turnOrder[turnIndex]) {
        // Unsick creatures from previous turn
        Object.keys(battlefield[key]).forEach(function(cardId) {
          var card = battlefield[key][cardId];
          console.log('Checking for unsick', card.id, ':', card.sick)
          if (card.sick) {
            card.sick = false;
            server.emit('unsick', {playerId: key, cardId: card.id});
          }
        });
        players[key].usedMana = 0;
        players[key].increaseMana();
        players[key].socket.emit('turn', players[key].mana);
      } else {
        players[key].socket.emit('wait', players[key].mana);
      }
    });
  });

  socket.on('disconnect', function(socket) {
    console.log('disconnected player', socket.player);
  });
});

app.listen(port, "0.0.0.0");
console.log('Listening on port', port);

function isInTurn(playerId) {
  return (playerId === turnOrder[turnIndex]);
}
