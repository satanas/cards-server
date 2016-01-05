var CardPopupView = Backbone.View.extend({
  el: '#card-details',
  initialize: function(options) {
    this.visible = false;
    this.popupTimer = null;
    this.abilities = ['rush', 'overwhelm', 'firstStrike', 'deathtouch', 'venom', 'transfusion', 'vampirism', 'berserker'];
    if (this.model) {
      this.model.on('change', this.render, this);
    }
    if (options.popup) {
      this.$el.hide();
    }
  },
  _show: function(x, y) {
    this.visible = true;
    xPos = x + 32.5 - 120;
    if (xPos < 0) xPos = 0;
    this.$el.css('top', (y - 360) + 'px');
    this.$el.css('left', xPos + 'px');
    this.render();
    this.$el.show();
  },
  _hide: function() {
    this.visible = false;
    this.$el.hide();
    this.$el.html('');
  },
  show: function(x, y, card) {
    this.model = card;
    this.model.on('change', this.render, this);

    this.popupTimer = setTimeout.call(this, function() {
      this._show(x, y);
    }, CARD_DETAILS_TIMEOUT);
  },
  hide: function() {
    if (this.visible) {
      this._hide();
    } else if (this.popupTimer !== null) {
      clearTimeout(this.popupTimer);
    }
    this.model.off('change');
    this.model = null;
    this.popupTimer = null;
  },
  render: function() {
    if (!this.model) return;

    var html = '';
    this.$el.attr('data-card-id', this.model.get('id'));

    var abilities = ''
    this.abilities.forEach(function(a) {
      if (this.model.get(a)) {
        abilities += '<div><strong>' + a + '</strong>: ' + abilitiesDescription[a] + '</div>';
      }
    }, this);

    var fText = this.model.get('flavorText');
    flavorText = (fText !== null && fText !== '') ? this.model.get('flavorText') : '';

    cardType = '';
    if (this.model.get('type') === "1") {
      cardType = 'Creature';
    }

    html = '<div class="mana">' + this.model.get('mana') + '</div>' +
      '<div class="image"><img src="/public/images/' + this.model.get('image') + '" /></div>' +
      '<div class="name">' + this.model.get('name') + '</div>' +
      '<div class="information">' +
      abilities +
      '  <div class="flavor-text">' + flavorText + '</div>' +
      '</div>' +
      '<div class="footer">' +
      '  <div class="stats">' +  this.model.get('attack') + '/' + this.model.get('health') + '</div>' +
      '  <div class="type">' + cardType + '</div>' +
      '  <div class="clearfix"></div>' +
      '</div>';

    this.$el.html(html);
    return html;
  },
});
