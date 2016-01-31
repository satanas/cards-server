'use strict';

var fs = require('fs');
var path = require('path');

var CardStorage = require('../../models/card_storage');
var CardPresenter = require('../../presenters/card');
var EnchantmentFormPresenter = require('../../presenters/enchantment_form');

var inputFieldTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'input_field.hbs'));
var selectFieldTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'select_field.hbs'));
var enchantmentFormTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'enchantment_form.hbs'));
var enchantmentTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'enchantment.hbs'));

var cardPresenter = new CardPresenter();
var enchantmentFormPresenter = new EnchantmentFormPresenter();


var controller = {};

controller.listCards = function* (next) {
  var cards = yield CardStorage.find().sort({ _id: 1});

  yield this.render('cards', {
    cards: cards,
    flash: this.getFlashMessage(this)
  });
};

controller.getCard = function *(next) {
  var card = null;
  var cardId = (this.params.id === 'new') ? null : this.params.id;
  var form = enchantmentFormPresenter.render();

  if (cardId) {
    card = cardPresenter.render(yield CardStorage.findOne({_id: cardId}));
  } else {
    card = cardPresenter.render(new CardStorage());
  }

  yield this.render('card', {
    cardId: cardId,
    cardPresenter: card,
    cardModel: JSON.stringify(card),
    enchantment_form: JSON.stringify(form),
    templates: {
      input_field: inputFieldTemplate,
      select_field: selectFieldTemplate,
      enchantment_form: enchantmentFormTemplate,
      enchantment: enchantmentTemplate
    },
    csrf: this.csrf,
    isNew: cardId ? false : true
  });
};

module.exports = controller;
