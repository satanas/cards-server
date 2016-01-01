var BattlefieldView = Backbone.View.extend({
  initialize: function(options) {
    this.own = options.own;
    this.views = {};
    this.collection.on('add', this.addCard, this);
    this.collection.on('remove', this.removeCard, this);
    this.collection.on('change', this.updateCard, this);
  },
  events: {
    'dragenter': 'dragEnter',
    'dragover': 'dragOver',
    'dragleave': 'dragLeave',
    'dragend': 'dragEnd',
    'drop': 'dropCard'
  },
  dragEnter: function(e) {
    if (!this.own) return false;
    var event = e.originalEvent;
    var dropTarget = event.target;
    var fromHand = (event.dataTransfer.types.indexOf("in-hand") >= 0) ? true : false;
    var toField = (dropTarget.getAttribute('data-played') === 'true') ? true : false;

    if (fromHand && !toField) {
      this.$el.addClass('dropable');
    }
    e.preventDefault();
    return false;
  },
  dragOver: function(e) {
    if (!this.own) return false;
    var event = e.originalEvent;
    e.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    return false;
  },
  dragLeave: function(e) {
    if (!this.own) return false;
    this.$el.removeClass('dropable');
    e.preventDefault();
    return false;
  },
  dragEnd: function(e) {
    if (!this.own) return false;
    this.$el.removeClass('dropable');
    $('ul.ground.dropable').each(function(e) {
      $(this).removeClass('dropable');
    });
  },
  dropCard: function(e) {
    if (!this.own) return false;
    this.dragEnd();
    e.preventDefault();
    var event = e.originalEvent;
    var data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (!data.played) {
      socket.emit('play-card', data.id);
    }
    this.$el.removeClass('dropable');
    $('.player.dropable').each(function(e) {
      $(this).removeClass('dropable');
    });
    return false;
  },
  addCard: function(card) {
    var cardView = new CardView({model: card, reversed: false});
    this.$el.append(cardView.render().el);
    this.views[card.id] = cardView;
  },
  removeCard: function() {
    delete this.views[card.id];
    this.render();
  },
  updateCard: function(card) {
    this.render();
  },
  prepareForBattle: function(card) {
    console.log('prepareForBattle', card);
    var model = this.collection.get(card.id);
    this.collection.updateCard(card);

    if (card.damage.venom > 0) {
      console.log('Card', card.id, 'received', card.damage.venom, 'points of damage due to venom');
      this.views[card.id].showPopup(card.damage.venom, 'venom');
    }
    if (card.health <= 0) {
      console.log('Card', card.id, 'has died due to venom');
      this.collection.removeCard(card);
    }
  },
  battleResults: function(card, subject) {
    var model = this.collection.get(card.id);
    this.collection.updateCard(card);

    if (card.damageReceived > 0) {
      console.log(subject, 'card', card.id, 'received', card.damageReceived, 'points of damage');
      this.views[card.id].showPopup(card.damageReceived, 'damage');
    }
    if (card.health <= 0) {
      console.log(subject, 'card', card.id, 'has died');
      this.collection.removeCard(card);
    }
    if (card.bloodfed > 0) {
      console.log(subject, 'card', card.id, 'received', card.bloodfed, 'points of health due to vampirism');
      setTimeout.call(this.views[card.id], this.views[card.id].showPopup, 500, card.bloodfed, 'heal');
    }
  },
  render: function() {
    this.$el.html('');
    this.collection.forEach(this.addCard, this);
  }
});
