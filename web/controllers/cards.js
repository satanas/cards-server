'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var CardStorage = require('../../models/card_storage');
var CardPresenter = require('../../presenters/card');
var EnchantmentFormPresenter = require('../../presenters/enchantment_form');

var inputFieldTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'input_field.hbs'));
var selectFieldTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'select_field.hbs'));
var enchantmentFormTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'enchantment_form.hbs'));
var enchantmentTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'enchantment.hbs'));

var cardPresenter = new CardPresenter();
var enchantmentFormPresenter = new EnchantmentFormPresenter();

const IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'images');

var controller = {};

controller.listCards = function* (next) {
  var cards = yield CardStorage.find().sort({ _id: 1});

  yield this.render('cards', {
    cards: cards,
    flash: this.getFlashMessage()
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
    flash: this.getFlashMessage(),
    isNew: cardId ? false : true
  });
};

controller.saveCard = function *(next) {
  var errors = [];
  var card = null;
  var files = this.request.body.files;
  var cardId = this.request.body.fields.id;

  try {
    this.assertCSRF(this.request.body.fields);
  } catch (e) {
    return this.addErrorAndRespond([{field: null, message: 'Request forbidden: ' + e.toString()}]);
  }

  if (cardId) {
    var card = yield CardStorage.findOne({_id: cardId});
    if (!card)
      return this.addErrorAndRespond([{field: null, message: `Card ${cardId} does not exist`}]);
  }

  // Request validation
  this.checkBody('name').notEmpty();
  this.checkBody('mana').notEmpty().isInt();
  this.checkBody('attack').notEmpty().isInt();
  this.checkBody('health').notEmpty().isInt().gt(0);
  this.checkBody('type').notEmpty().isInt();
  this.checkBody('').clearAttributes();

  this.request.body.fields.enchantments = JSON.parse(this.request.body.fields.enchantments);

  // Image is required for new cards
  if (!cardId && (files.image.name === '' || files.image.size === 0))
    errors.push({field: 'image', message: 'image can not be empty'});

  errors = errors.concat(_.map(this.errors, function(err) {
    for(var i in err) return { field: i, message: err[i] }
  }));
  this.errors = errors;

  if (errors.length > 0)
    return this.respondErrors();

  var newCard = new CardStorage(this.request.body.fields);
  newCard.id = cardId ? cardId : newCard._id.toString();

  if (files.image.name !== '' && files.image.size > 0) {
    newCard.image = files.image.name;
    fs.rename(files.image.path, path.join(IMAGES_DIR, files.image.name));
  }

  try {
    if (cardId) {
      var params = newCard.toJSON();
      delete params._id;
      console.log('newCard update', params);
      yield CardStorage.update({_id: cardId}, params);
    } else {
      console.log('newCard save', newCard);
      yield newCard.save();
    }

    var response = {
      card: cardPresenter.render(newCard)
    };
    if (!cardId) {
      response.redirect = true;
      response.url = '/cards/' + newCard.id;
      this.addFlashMessage('success', 'Card saved successfully');
    }
    this.body = response;
  } catch (e) {
    console.log('err', e);
    this.addFlashMessage('alert', 'Error saving card: ' + e.toString());
    this.body = {
      redirect: true,
      url: (cardId) ? '/cards/' + cardId : '/cards'
    };
  }
};

module.exports = controller;
