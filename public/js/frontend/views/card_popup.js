var CardPopupView = Backbone.View.extend({
  initialize: function(options) {
    this.visible = false;
    this.popupTimer = null;
    this.abilities = ['rush', 'overwhelm', 'firstStrike', 'deathtouch', 'venom', 'transfusion', 'vampirism', 'berserker'];
    this.popup = $('#card-details');
    this.popup.hide();
  },
  _show: function(x, y, card) {
    this.visible = true;
    xPos = x + 32.5 - 120;
    if (xPos < 0) xPos = 0;
    this.render(card);
    this.popup.css('top', (y - 360) + 'px');
    this.popup.css('left', xPos + 'px');
    this.popup.html(this.render(card));
    this.popup.show();
  },
  _hide: function() {
    this.visible = false;
    this.popup.hide();
    this.popup.html('');
  },
  show: function(x, y, card) {
    this.popupTimer = setTimeout.call(this, function() {
      this._show(x, y, card);
    }, CARD_DETAILS_TIMEOUT);
  },
  hide: function() {
    if (this.visible) {
      this._hide();
    } else if (this.popupTimer !== null) {
      clearTimeout(this.popupTimer);
    }
    this.popupTimer = null;
  },
  render: function(model) {
    var html = '';
    this.$el.attr('data-card-id', model.get('id'));

    var abilities = ''
    this.abilities.forEach(function(a) {
      if (model.get(a)) {
        abilities += '<div><strong>' + a + '</strong>: ' + abilitiesDescription[a] + '</div>';
      }
    })

    var fText = model.get('flavorText');
    flavorText = (fText !== null && fText !== '') ? model.get('flavorText') : '';

    cardType = '';
    if (model.get('type') === "1") {
      cardType = 'Creature';
    }

    html = '<div class="mana">' + model.get('mana') + '</div>' +
      '<div class="image"><img src="images/' + model.get('image') + '" /></div>' +
      '<div class="name">' + model.get('name') + '</div>' +
      '<div class="information">' +
      abilities +
      '  <div class="flavor-text">' + flavorText + '</div>' +
      '</div>' +
      '<div class="footer">' +
      '  <div class="stats">' +  model.get('attack') + '/' + model.get('health') + '</div>' +
      '  <div class="type">' + cardType + '</div>' +
      '  <div class="clearfix"></div>' +
      '</div>';

    this.$el.html(html);
    return html;
  },
});
