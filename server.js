var http = require('http');
var port = process.argv[2] || 3000;
var app = http.createServer();
var Player = require('./player');

var players = [];

var server = require('socket.io')(app);
server.on('connection', function(client) {
  if (players.length === 0) {
    console.log('Connected player 1');
    players.push(new Player(client));
    server.emit('joined', 'Waiting for opponent to start');
  } else if (players.length === 1) {
    console.log('Connected player 2');
    players.push(new Player(client));
    server.emit('joined', 'Ready to start');
    client.broadcast.emit('start');
    console.log('Fight!');
  } else {
    server.emit('rejected', 'Battle started');
    console.log('Connection refused, battle started');
  }
});

server.on('disconnect', function(client) {
  console.log('disconnected player', client.player);
});


app.listen(port, "0.0.0.0");
console.log('Listening on port', port);
