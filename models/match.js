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

Match.prototype.joinPlayer = function(socket) {
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

module.exports = Match;
