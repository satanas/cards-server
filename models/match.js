var Player = require('./player');

function Match(server, socket) {
  this.players = {};
  this.battlefield = {};
  this.turnOrder = [];
  this.turnIndex = 0;
  this.matchEnded = false;
  this.socket = socket;
  this.server = server;
  // Generate
  this.id = '123120391280398102938';
}

Match.prototype.create = function() {
  this.joinPlayer();

  console.log('Match ' + this.id + ' created');
  this.socket.emit('match-created', this.id);
};

Match.prototype.joinPlayer = function() {
  this.players[this.socket.id] = new Player(this.socket);
  this.battlefield[this.socket.id] = {};
  this.socket.emit('joined', {
    'player': {
      'id': this.socket.id,
      'health': this.players[this.socket.id].health
    }
  });
};

Match.prototype.start = function() {
  this.server.emit('ready');
  console.log('Ready!');
  this.turnOrder = Object.keys(this.players);
  console.log('ble 1', this.turnOrder);
  this.turnOrder.shuffle();
  console.log('ble 2', this.turnOrder);

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
    });
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
    });
    this.players[key].socket.emit('hands', hands);
  });
};

module.exports = Match;
