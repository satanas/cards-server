var _ = require('underscore');
var Global = require('../global');
var Player = require('./player');
var Battlefield = require('./battlefield');

function Match(socket, cardStorage) {
  this.status = Global.MATCH_STATUS.Open;
  this.players = {};
  this.battlefield = new Battlefield();
  this.turnOrder = [];
  this.turnIndex = 0;

  // Generate
  this.id = '123120391280398102938';
  console.log(`Match ${this.id} created`);
  socket.emit('match-created', this.id);

  this.join(socket, cardStorage);
}

Match.prototype.join = function(socket, cardStorage) {
  // Get players list before adding a new player
  var playersList = [];
  this.iterate(function(key) {
    playersList.push(key);
  });

  this.players[socket.id] = new Player(socket, cardStorage);
  this.battlefield.addPlayer(socket.id);

  socket.emit('joined', {
    'id': socket.id,
    'others': playersList.length > 0 ? playersList : null
  });

  this.emitAllBut(socket.id, 'new-player', {
    'id': socket.id
  })
};

Match.prototype.start = function() {
  this.status = Global.MATCH_STATUS.Started;
  console.log('Match started');
  this.broadcast('match-started');

  this.turnOrder = Object.keys(this.players);
  this.turnOrder.shuffle();

  // Send hands to users
  for (var playerId in this.players) {
    var opponents = [];
    var opponentKeys = _.filter(Object.keys(this.players), function(k) {
      return (k !== playerId);
    });

    opponentKeys.forEach(function(opponentId) {
      opponents.push({
        'player': {
          'id': opponentId,
          'totalMana': this.players[opponentId].totalMana,
          'usedMana': this.players[opponentId].usedMana,
          'health': this.players[opponentId].health,
          'cards': this.players[opponentId].hand.length
        }
      });
    }, this);

    this.emit(playerId, 'player', {
      'player': {
        'id': playerId,
        'health': this.players[playerId].health
      }
    });
    this.emit(playerId, 'opponents', {
      'opponents': opponents
    });
    this.emit(playerId, 'hand', {
      'player': {
        'id': playerId,
        'hand': this.players[playerId].hand
      }
    });
  }
};

Match.prototype.startTurn = function() {
  var playerId = this.turnOrder[this.turnIndex];
  var newCard = this.players[playerId].startTurn();

  var players = {};
  players[playerId] = {
    cards: this.battlefield.untap(playerId)
  };

  this.broadcast('battlefield', {
    players: players
  });

  if (newCard) {
    console.log('New card with id ' + newCard.id +' for player ' + playerId +', hand length:', this.players[playerId].hand.length);
    console.log('newcard', newCard);
  }

  this.emit(playerId, 'turn', {
    'player': {
      'id': playerId,
      'totalMana': this.players[playerId].totalMana,
      'usedMana': this.players[playerId].usedMana,
      'card': newCard
    }
  });

  this.emitAllBut(playerId, 'wait', {
    'player': {
      'id': playerId,
      'totalMana': this.players[playerId].totalMana,
      'usedMana': this.players[playerId].usedMana,
      'new_card': !!newCard
    }
  });
};

Match.prototype.playCard = function(playerId, cardId) {
  if (!this.inTurn(playerId)) return this.emit(playerId, 'no-turn');

  var player = this.players[playerId],
      canPlayCard = player.canPlayCard(cardId);

  if (canPlayCard > 0) {
    var card = player.playCard(cardId);
    // Rush
    if (card.rush) {
      card.sick = false;
    }
    // Stealth
    if (card.stealth) {
      card.hidden = true;
    }
    this.battlefield.playCard(playerId, card);
    console.log('Player', playerId, 'put card', cardId, 'into the battlefield');
    console.log(card);
    this.broadcast('played-card', {
      'player': {
        'id': playerId,
        'totalMana': player.totalMana,
        'usedMana': player.usedMana
      },
      'card': card,
    });
  } else if (canPlayCard === Global.ERRORS.NO_MANA) {
    this.emit(playerId, 'no-mana');
  } else if (canPlayCard === Global.ERRORS.CARD_NOT_FOUND) {
    this.emit(playerId, 'card-not-found');
  }
};

Match.prototype.attack = function(playerId, data) {
  if (!this.inTurn(playerId)) return this.emit(playerId, 'no-turn');
  if (!this.isPlayer(data.defender.playerId)) return this.emit(playerId, 'no-player');

  var attacker = this.battlefield.getCard(playerId, data.attacker.cardId),
      defender = this.battlefield.getCard(data.defender.playerId, data.defender.cardId),
      player = this.players[playerId],
      opponent = this.players[data.defender.playerId],
      spareDamage = 0,
      attackerTransfused = 0,
      defenderTransfused = 0,
      attackerBloodFed = 0,
      defenderBloodFed = 0,
      damageReceivedByAttacker = 0,
      damageReceivedByDefender = 0,
      actionAttacker = null,
      actionDefender = null;

  if (!attacker) {
    console.log('Attacker not found');
    return this.emit(playerId, 'attacked-not-found');
  }
  if (!defender) {
    console.log('Defender not found');
    return this.emit(playerId, 'defender-not-found');
  }
  if (attacker.sick) {
    console.log('Attacker is sick');
    return this.emit(playerId, 'card-sick');
  }
  if (attacker.used) {
    console.log('Attacker was used');
    return this.emit(playerId, 'card-used');
  }
  if (attacker.playerId === defender.playerId && attacker.id === defender.id) {
    console.log('Attack rejected. Card can not attack itself');
    return this.emit(playerId, 'invalid-op', 'Card can not attack itself');
  }
  if (defender.hidden) {
    console.log('Attack rejected. Defender is hidden');
    return this.emit(playerId, 'card-hidden');
  }

  console.log('Battle between card', attacker.id, '(from player', playerId, ') and card', defender.id, '(from player', data.defender.playerId, ')');

  attacker.used = true;
  attacker.hidden = false;

  // Berserker
  if (attacker.berserker) {
    if (!attacker.secondAttack) {
      attacker.used = false;
      attacker.secondAttack = true;
    }
  }

  // First strike and regular attack
  if (attacker.firstStrike && !defender.firstStrike) {
    defender.health -= attacker.attack;
    damageReceivedByDefender = attacker.attack;
    if (defender.health > 0) {
      attacker.health -= defender.attack;
      damageReceivedByAttacker = defender.attack;
    } else {
      damageReceivedByAttacker = 0;
      console.log('Attacker did not receive damage because it killed the defender with first strike');
    }
  } else if (!attacker.firstStrike && defender.firstStrike) {
    attacker.health -= defender.attack;
    damageReceivedByAttacker = defender.attack;
    if (attacker.health > 0) {
      defender.health -= attacker.attack;
      damageReceivedByDefender = attacker.attack;
    } else {
      damageReceivedByDefender = 0;
      console.log('Defender did not receive damage because it killed the attacker with first strike');
    }
  } else {
    attacker.health -= defender.attack;
    damageReceivedByAttacker = defender.attack;

    defender.health -= attacker.attack;
    damageReceivedByDefender = attacker.attack;
  }

  // Endurance
  if (attacker.endurance && attacker.health > 0) {
    attacker.health += damageReceivedByAttacker;
    damageReceivedByAttacker = 0;
  }
  if (defender.endurance && defender.health > 0) {
    defender.health += damageReceivedByDefender;
    damageReceivedByDefender = 0;
  }

  console.log('Attacker: atk =', damageReceivedByDefender, '| health =', attacker.health);
  console.log('Defender: atk =', damageReceivedByAttacker, '| health =', defender.health);

  // Overwhelm
  if (attacker.overwhelm) {
    spareDamage = Math.abs(defender.health);
    if (spareDamage > 0) {
      console.log('Dealing', spareDamage, 'of extra damage due to overwhelm');
      opponent.health -= spareDamage;
    }
  }

  // Deathtouch
  if (attacker.deathtouch && damageReceivedByDefender > 0) {
    console.log('Defender killed due to deathtouch');
    defender.health = 0;
  }
  if (defender.deathtouch && damageReceivedByAttacker > 0) {
    console.log('Attacker killed due to deathtouch');
    attacker.health = 0;
  }

  // Curse
  if (attacker.health <= 0 && attacker.curse) {
    console.log('Defender killed due to curse');
    defender.health = 0;
  }
  if (defender.health <= 0 && defender.curse) {
    console.log('Attacker killed due to curse');
    attacker.health = 0;
  }

  // Invenom
  if (attacker.venom && damageReceivedByDefender > 0) {
    console.log('Defender invenomed');
    defender.invenomed = true;
  }
  if (defender.venom && damageReceivedByAttacker > 0) {
    console.log('Attacker invenomed');
    attacker.invenomed = true;
  }

  // Transfusion
  if (defender.health <= 0 && attacker.transfusion && attacker.health > 0) {
    console.log('Attacking player got 1 health due to transfusion');
    attackerTransfused = 1;
    player.heal(attackerTransfused);
  }
  if (attacker.health <= 0 && defender.transfusion && defender.health > 0) {
    console.log('Defending player got 1 health due to transfusion');
    defenderTransfused = 1;
    opponent.heal(defenderTransfused);
  }

  // Vampirism
  if (defender.health <= 0 && attacker.vampirism && attacker.health > 0) {
    console.log('Attacking card got 1 health due to vampirism');
    attackerBloodFed = 1;
    attacker.heal(attackerBloodFed);
  }
  if (attacker.health <= 0 && defender.vampirism && defender.health > 0) {
    console.log('Defending card got 1 health due to vampirism');
    defenderBloodFed = 1;
    defender.heal(defenderBloodFed);
    if (opponent.health > Global.MAX_HEALTH) opponent.health = Global.MAX_HEALTH;
  }


  // Remove death cards from battlefield
  if (attacker.health <= 0) {
    console.log('Attacking card with id '+ attacker.id + ' (from player '+ playerId + ') died');
    attacker.health = 0;
    delete this.battlefield.removeCard(playerId, data.attacker.cardId);
  }
  if (defender.health <= 0) {
    console.log('Defending card with id '+ defender.id+ ' (from player ' + data.defender.playerId + ') died');
    defender.health = 0;
    delete this.battlefield.removeCard(data.defender.playerId, data.defender.cardId);
  }

  this.broadcast('battle', {
    'attacker': {
      'player': {
        'id': player.id,
        'health': player.health,
        'transfused': attackerTransfused
      },
      'card': {
        'id': attacker.id,
        'used': attacker.used,
        'damageDealt': attacker.attack,
        'damageReceived': damageReceivedByAttacker,
        'health': attacker.health,
        'invenomed': attacker.invenomed,
        'bloodfed': attackerBloodFed
      }
    },
    'defender': {
      'player': {
        'id': opponent.id,
        'damageDealt': 0,
        'overwhelmed': spareDamage,
        'health': opponent.health,
        'transfused': defenderTransfused
      },
      'card': {
        'id': defender.id,
        'damageDealt': defender.attack,
        'damageReceived': damageReceivedByDefender,
        'health': defender.health,
        'invenomed': defender.invenomed,
        'bloodfed': defenderBloodFed
      }
    }
  });

  this.checkVictory();
};

Match.prototype.directAttack = function(playerId, data) {
  console.log('Direct attack requested');
  if (!this.inTurn(playerId)) return this.emit(playerId, 'no-turn');
  if (!this.isPlayer(data.defender.playerId)) return this.emit(playerId, 'no-player');

  var attacker = this.battlefield.getCard(playerId, data.attacker.cardId),
      opponent = this.players[data.defender.playerId];

  if (!attacker) {
    console.log('Attacker not found');
    return this.emit(playerId, 'attacked-not-found');
  }
  if (attacker.sick) {
    console.log('Attacker is sick');
    return this.emit(playerId, 'card-sick');
  }
  if (attacker.used) {
    console.log('Attacker was used');
    return this.emit(playerId, 'card-used');
  }

  console.log('Card', attacker.id, '(from player', playerId, ') attacked player', opponent.id, 'with', attacker.attack, 'pt(s) of damage');
  opponent.health -= attacker.attack;

  attacker.used = true;
  attacker.hidden = false;

  // Berserker
  if (attacker.berserker) {
    if (!attacker.secondAttack) {
      attacker.used = false;
      attacker.secondAttack = true;
    }
  }

  this.broadcast('direct-damage', {
    'attacker': {
      'player': {
        'id': playerId
      },
      'card': {
        'id': attacker.id,
        'damageDealt': attacker.attack,
        'damageReceived': 0,
        'health': attacker.health,
        'used': attacker.used,
        'hidden': attacker.hidden
      }
    },
    'defender': {
      'player': {
        'id': data.defender.playerId,
        'damageDealt': 0,
        'damageReceived': attacker.attack,
        'health': opponent.health
      }
    }
  });

  this.checkVictory();
};

Match.prototype.endTurn = function(playerId) {
  if (!this.inTurn(playerId)) return this.emit(playerId, 'no-turn');

  console.log('Player', playerId, 'ended turn');
  this.turnIndex += 1;
  if (this.turnIndex >= this.turnOrder.length) {
    this.turnIndex = 0;
  }
  console.log('New turn for player', this.turnOrder[this.turnIndex], this.turnIndex);
  this.startTurn();
};

// Emit event to socket associated to playerId
Match.prototype.emit = function(playerId, command, data) {
  this.players[playerId].socket.emit(command, data);
};

// Broadcast event to all players
Match.prototype.broadcast = function(command, data) {
  for (var id in this.players) {
    this.players[id].socket.emit(command, data);
  }
};

// Broadcast event to all players except the one indicated by playerId
Match.prototype.emitAllBut = function(playerId, command, data) {
  for (var id in this.players) {
    if (id !== playerId) {
      this.players[id].socket.emit(command, data);
    }
  }
};

// Iterates over the players and executes a callback passing key, value
Match.prototype.iterate = function(cb) {
  Object.keys(this.players).forEach(function(key) {
    cb(key, this.players[key]);
  }, this);
};

Match.prototype.inTurn = function(playerId) {
  return (playerId === this.turnOrder[this.turnIndex]);
};

Match.prototype.isPlayer = function(playerId) {
  return (Object.keys(this.players).indexOf(playerId) >= 0);
};

Match.prototype.isEnded = function() {
  return this.status === Global.MATCH_STATUS.Ended;
};

Match.prototype.checkVictory = function() {
  for (var key in this.players) {
    var player = this.players[key];
    if (player.health <= 0) {
      console.log('Player', player.id, 'defeated');
      this.broadcast('defeat', {
        'playerId': key
      });
      delete this.players[key];
    }
  }

  if (Object.keys(this.players).length === 1) {
    var playerId = Object.keys(this.players)[0];
    this.status = Global.MATCH_STATUS.Ended;
    console.log('Player', playerId, 'won');
    this.broadcast('victory', {
      'playerId': playerId
    });
  }
};

module.exports = Match;
