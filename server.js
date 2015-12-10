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
    var match = findMatch(socket);
    if (match) {
      // FIXME: Validate on started matches
      match.join(socket);
      if (Object.keys(match.players).length > 1) {
        match.start();
        match.startTurn();
      }
    }
  });

  socket.on('play-card', function(cardId) {
    var match = findMatch(socket);
    if (match) match.playCard(socket.id, cardId);
  });

  socket.on('attack', function(data) {
    var match = findMatch(socket);
    if (match) match.attack(socket.id, data);
  });

  socket.on('direct-attack', function(data) {
    var match = findMatch(socket);
    if (match) match.attack(socket.id, data);
  });

  socket.on('end-turn', function(data) {
    var match = findMatch(socket);
    if (match) match.endTurn(socket.id);
  });

  socket.on('disconnect', function(socket) {
    console.log('disconnected player', socket.player);
  });
});

app.listen(port, "0.0.0.0");
console.log('Listening on port', port);

function findMatch(socket) {
  var match = null;

  for (var i; i < matches.length; i++) {
    var m = matches[i];
    var players = Object.keys(m.players);
    if (players.indexOf(socket.id) >= 0) {
      match = m;
      break;
    }
  }

  if (match === null) {
    console.log(`Match ${socket.id} not found`);
    socket.emit('match-not-found');
  } else if (match.isEnded()) {
    console.log(`Match ${socket.id} ended`);
    socket.emit('match-ended');
    match = null;
  }
  return match;
}
