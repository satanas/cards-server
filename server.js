var http = require('http');
var _ = require('underscore');
var random = require('./random');
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
    players[socket.id].mana = 1;
    battlefield[socket.id] = {};
    socket.emit('joined', 'Waiting for opponent to start');
  } else if (Object.keys(players).length === 1) {
    players[socket.id] = new Player(socket);
    players[socket.id].mana = 1;
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
        players[key].socket.emit('turn');
      } else {
        players[key].socket.emit('no-turn');
      }
    });
  } else {
    server.emit('rejected', 'Battle started');
    console.log('Connection refused, battle started');
  }

  socket.on('draw', function(cardId) {
    var player = players[socket.id];
    if (players[socket.id].canDraw(cardId)) {
      var card = players[socket.id].drawCard(cardId);
      battlefield[socket.id][card.id] = card;
      console.log('drawed card to battlefield', cardId);
    } else {
      socket.emit('no-mana');
    }
  });

  socket.on('end-turn', function(data) {
  });

  socket.on('disconnect', function(socket) {
    console.log('disconnected player', socket.player);
  });
});

app.listen(port, "0.0.0.0");
console.log('Listening on port', port);
