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
    var player = players[socket.id];
    var canDraw = players[socket.id].canDraw(cardId);
    if (canDraw == true) {
      var card = players[socket.id].drawCard(cardId);
      battlefield[socket.id][card.id] = card;
      console.log('Player', socket.id, 'drawed card', cardId, 'to battlefield');
      server.emit('drawed-card', {
        'player': socket.id,
        'card': cardId,
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

  socket.on('end-turn', function(data) {
    console.log('Player', socket.id, 'ended turn');
    turnIndex += 1;
    if (turnIndex >= turnOrder.length) {
      turnIndex = 0;
    }
    console.log('New turn for player', turnOrder[turnIndex], turnIndex);
    Object.keys(players).forEach(function(key) {
      if (key === turnOrder[turnIndex]) {
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
