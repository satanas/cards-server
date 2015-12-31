var TurnView = Backbone.View.extend({
  events: {
    'click': 'endTurn'
  },
  initialize: function() {
    $('#action-turn').on('click', function(e) {
      var action = '';
      if (defender.hasOwnProperty('cardId')) {
        action = 'attack';
      } else {
        action = 'direct-attack';
      }
      socket.emit(action, {
        'attacker': attacker,
        'defender': defender
      });
    });
  },
  onTurn: function() {
    $('#end-turn').show();
    $('#enemy-turn').hide();
  },
  enemyTurn: function(id) {
    $('#end-turn').hide();
    $('#enemy-turn').show();
    this.enableAction(false);
  },
  endTurn: function() {
    socket.emit('end-turn');
  },
  enableAction: function(value) {
    if (value) {
      $('#action-turn').show();
    } else {
      $('#action-turn').hide();
    }
  }
});
