var http = require('http');
var _ = require('underscore');
var random = require('./random');
var Player = require('./player');

var port = process.argv[2] || 3000;
var app = http.createServer();

var players = [];
var battlefield = {};

var server = require('socket.io')(app);
server.on('connection', function(socket) {
  if (players.length === 0) {
    //console.log('Connected player 1');
    players.push(new Player(socket));
    socket.emit('joined', 'Waiting for opponent to start');
  } else if (players.length === 1) {
    //console.log('Connected player 2');
    players.push(new Player(socket));
    socket.emit('joined', 'Ready to start');
    server.emit('ready');
    console.log('Ready!');
    players[0].socket.emit('hand', players[0].hand);
    players[1].socket.emit('hand', players[1].hand);
    var turn = random.integer(0, 1);
    for (var i=0; i < players.length; i++) {
      battlefield[players[i].socket.id] = {};
      if (turn === i) {
        players[i].socket.emit('turn');
      } else {
        players[i].socket.emit('no-turn');
      }
    }
    console.log('battlefields', battlefield);
  } else {
    server.emit('rejected', 'Battle started');
    console.log('Connection refused, battle started');
  }

  socket.on('draw', function(cardId) {
    console.log('drawing card', cardId);
    var player = _.find(players, function(p) {
      return p.id === socket.id;
    });
    var card = player.drawCard(cardId);
    battlefield[socket.id][card.id] = card;
    console.log('hand', player.hand);
    console.log('battlefields', battlefield);
  });

  socket.on('disconnect', function(socket) {
    console.log('disconnected player', socket.player);
  });
});

app.listen(port, "0.0.0.0");
console.log('Listening on port', port);
