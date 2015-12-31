var HandView = Backbone.View.extend({
  initialize: function(options) {
    this.opponent = options.opponent,
    this.collection.on('add', this.addCard, this);
    this.collection.on('remove', this.removeCard, this);
  },
  addCard: function(card) {
    var cardView = null;
    if (this.opponent) {
      cardView = new CardView({model: card, reversed: true});
    } else {
      cardView = new CardView({model: card, reversed: false});
    }
    this.$el.append(cardView.render().el);
  },
  removeCard: function(card) {
    var cardId = card.get('id');
    var playerId = card.get('playerId');
    $('li[data-player-id="' + playerId + '"][data-card-id="' + cardId + '"]').remove();
  },
  removeUnknownCard: function(playerId) {
    $('li[data-player-id="' + playerId + '"]')[0].remove();
  },
  render: function() {
    this.collection.forEach(this.addCard, this);
    return this;
  }
});
