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
  socket.emit('match-created', this.id);
};

Math.prototype.joinPlayer = function() {
  this.players[this.socket.id] = new Player(this.socket);
  this.battlefield[this.socket.id] = {};
  this.socket.emit('joined', {
    'player': {
      'id': this.socket.id,
      'health': this.players[this.socket.id].health
    }
  });
};

module.exports = Match;
