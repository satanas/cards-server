'use strict';

require('./mixins');

var http = require('http');
var mongoose = require('mongoose');

var global = require('../global');
var Match = require('../models/match');
var Player = require('../models/player');
var Card = require('../models/card');

var port = process.argv[2] || 3000;
var app = http.createServer();

var players = {};
var battlefield = {};
var turnOrder = [];
var turnIndex = 0;
var matchEnded = false;
var matches = [];
var cardStorage = null;

var server = require('socket.io')(app);

mongoose.connect('mongodb://localhost/magic');

Card.find().exec(function(err, data) {
  cardStorage = data;
  console.log('Card storage read');
});

server.on('connection', function(socket) {
  console.log(`Client ${socket.id} connecting`);

  socket.on('new-match', function() {
    if (cardStorage === null) {
      socket.emit('server-not-ready');
      return;
    }
    // FIXME: Remove me
    matches = [];
    // ***************
    var match = new Match(socket, cardStorage);
    matches.push(match);
  });

  socket.on('join-match', function(matchId) {
    if (cardStorage === null) {
      socket.emit('server-not-ready');
      return;
    }
    // Search for match
    var match = findMatch(socket, matchId);
    if (match) {
      // FIXME: Validate on started matches
      match.join(socket, cardStorage);
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
    if (match) match.directAttack(socket.id, data);
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
console.log('Server listening on port', port);

function findMatch(socket, matchId) {
  var match = null;

  for (var i=0; i < matches.length; i++) {
    var m = matches[i];

    if (!!matchId) {
      if (m.id === matchId) {
        match = m;
        break;
      }
    } else {
      var players = Object.keys(m.players);
      if (players.indexOf(socket.id) >= 0) {
        match = m;
        break;
      }
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
