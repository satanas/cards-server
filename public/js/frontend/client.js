var host = window.location.host.split(':')[0],
    socket = io(host + ':3000'),
    battlefield = {},
    hands = {},
    players = {},
    views = {
      players: {},
      battlefield: {},
      cardDetails: null
    },
    ownId = null,
    opponentId = null,

    popupTimer = null,

    // Unintialized Views
    ownHand = null,
    opponentHand = null;

function newMatch() {
  console.log('requesting new match');
  socket.emit('new-match');
}

function joinMatch() {
  var matchId = $('#match-id').val();
  console.log('Joining match ' + matchId);
  socket.emit('join-match', matchId);
}

socket.on('match-created', function(matchId) {
  console.log('matchId', matchId);
});

socket.on('joined', function (data) {
  console.log('Joined');
});

socket.on('new-player', function (data) {
  console.log('new player joined', data);
});

socket.on('rejected', function (data) {
  console.log('Rejected:', data);
});

socket.on('match-started', function (data) {
  console.log('Match started');
  $('#battlefield').html('');
});

socket.on('player', function (data) {
  console.log('Your ID:', data);
  ownId = data.player.id;
  hands[ownId] = new Hand();
  battlefield[ownId] = new Battlefield();
  players[ownId] = new Player(data.player);
  views.players[ownId] = new PlayerView({el: '#you > .util[data-player-ui="true"]', model: players[ownId]});

  $('#battlefield').prepend('<div class="' + ownId + '"><ul class="ground"></ul></div>');

  ownHand = new HandView({collection: hands[ownId], el:'#you > .util > ul', opponent: false});
  views.battlefield[ownId] = new BattlefieldView({collection: battlefield[ownId], el: '#battlefield .' + ownId + ' .ground', own: true});
});

socket.on('opponents', function (data) {
  var opponent = data.opponents[0].player;
  console.log('Opponents:', opponent);
  opponentId = opponent.id;
  hands[opponentId] = new Hand();
  battlefield[opponentId] = new Battlefield();
  players[opponentId] = new Player(opponent);
  views.players[opponentId] = new PlayerView({el: '#opponent > .util[data-player-ui="true"]', model: players[opponentId]});

  $('#battlefield').prepend('<div class="' + opponentId + '"><ul class="ground"></ul></div>');

  opponentHand = new HandView({collection: hands[opponentId], el:'#opponent > .util > ul', opponent: true});
  views.battlefield[opponentId] = new BattlefieldView({collection: battlefield[opponentId], el: '#battlefield .' + opponentId + ' .ground', own: false});

  for (var i=0; i < data.opponents[0].player.cards; i++) {
    var card = new Card({});
    card.set({'playerId': opponentId});
    hands[opponentId].add(card);
  }
});

socket.on('hand', function (data) {
  data.player.hand.forEach(function(d) {
    var card = new Card(d);
    hands[ownId].add(card);
  });
  console.log('Hands:', data);
});

socket.on('battlefield', function (data) {
  console.log('battlefield', data);
  for (var playerId in data.players) {
    data.players[playerId].cards.forEach(function(c) {
      views.battlefield[playerId].prepareForBattle(c);
    });
  }
});

socket.on('turn', function (data) {
  turnView.onTurn();
  players[data.player.id].set(data.player);

  console.log('Your turn. Current mana:', data.player.totalMana + '. New card:', data.player.card.id, data);
  if (data.player.card) {
    hands[ownId].add(new Card(data.player.card));
  } else {
    $('#you > .util > .deck').css('background-color', '#fff');
  }
  alert('Your turn!');
});

socket.on('wait', function (data) {
  turnView.enemyTurn();
  players[data.player.id].set(data.player);

  console.log('You have to wait your turn. New card for ' + data.player.id);
  if (data.player.new_card) {
    var card = new Card({});
    card.set({'playerId': data.player.id});
    hands[data.player.id].add(card);
  } else {
    $('#opponent > .util > .deck').css('background-color', '#fff');
  }
});

socket.on('played-card', function (data) {
  console.log('played card', data);
  console.log('Player', data.player.id, 'played card', data.card.id + ' and has', String(data.player.totalMana - data.player.usedMana), 'mana remaining');
  hands[data.player.id].remove(data.card.id);
  players[data.player.id].set(data.player);
  if (data.player.id !== ownId) {
    // FIXME: Please
    opponentHand.removeUnknownCard(opponentId);
  }
  card = new Card(data.card);
  battlefield[data.player.id].add(card);
});

socket.on('battle', function (data) {
  console.log('battle', data);
  var atkPlayer = data.attacker.player,
      defPlayer = data.defender.player,
      atkCard = data.attacker.card,
      defCard = data.defender.card;

  if (atkPlayer.transfused > 0) {
    console.log('Player', atkPlayer.id, 'has been transfused with', atkPlayer.transfused, 'health');
    players[atkPlayer.id].receiveHealth(atkPlayer.transfused, atkPlayer.health);
  }
  if (defPlayer.transfused > 0) {
    console.log('Player', defPlayer.id, 'has been transfused with', defPlayer.transfused, 'health');
    players[defPlayer.id].receiveHealth(defPlayer.transfused, defPlayer.health);
  }

  if (defPlayer.overwhelmed > 0) {
    console.log('Player', defPlayer.id, 'has been hit with extra damage of', defPlayer.overwhelmed);
    players[defPlayer.id].receiveDamage(defPlayer.overwhelmed, defPlayer.health);
  }

  views.battlefield[atkPlayer.id].battleResults(atkCard, 'Attacking');
  views.battlefield[defPlayer.id].battleResults(defCard, 'Defending');
});

socket.on('direct-damage', function (data) {
  console.log('direct-damage', data);
  var card = data.attacker.card,
      player = data.defender.player;

  battlefield[data.attacker.player.id].updateCard(card);
  players[player.id].receiveDamage(player.damageReceived, player.health);
  console.log('Player ' + player.id + ' has received' + player.damageReceived, 'points of direct damage');
});

socket.on('leader-defeated', function (data) {
  showMessage('Leader defeated', 'Leader', data, 'have been defeated');
});

socket.on('victory', function (data) {
  if (data.playerId === ownId) {
    showMessage('Victory', 'You win');
  }
});

socket.on('defeat', function (data) {
  if (data.playerId === ownId) {
    showMessage('Defeat', 'You lose');
  }
});

// Errors

socket.on('match-not-found', function (data) {
  console.log('Match not found');
});

socket.on('match-ended', function (data) {
  console.log('Match ended');
  showMessage('Match ended', "You can't access the match because it ended");
});

socket.on('no-mana', function (data) {
  console.log('You don\'t have enough mana to play that card');
  showMessage('No mana', "You don't have enough mana to play that card");
});

socket.on('no-turn', function (data) {
  console.log('It is not your turn. You can not do anything');
});

socket.on('no-player', function (data) {
  console.log('That player does not exist');
});

socket.on('card-not-found', function (data) {
  console.log('That card is not yours');
  showMessage('Card not found', "That card does not exist here");
});

socket.on('card-sick', function (data) {
  console.log('You can not play that card because it is sick');
});

socket.on('card-used', function (data) {
  showMessage('Card used', "That card was already used");
  console.log('That card was already used');
});

socket.on('invalid-op', function (data) {
  showMessage('Invalid operation', data);
  console.log('Invalid operation. You can not do that');
});

socket.on('server-not-ready', function (data) {
  showMessage('Server not ready', 'Please, try again in a couple of minutes');
});

function showMessage(title, message) {
  $("#modal-title").html(title);
  $("#modal-description").html(message);
  $('#modal-message').foundation('reveal', 'open');
}

function getPosition (element) {
  var xPosition = 0, yPosition = 0;

  while (element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
  }
  return { x: xPosition, y: yPosition };
}

$(document).ready(function() {
  turnView = new TurnView({el: '#end-turn'});
  views.cardDetails = new CardPopupView();
});
