var Card = Backbone.Model.extend({
  defaults: {
    id: null,
    playerId: null,
    name: '',
    type: null,
    description: '',
    flavorText: '',
    mana: 1,
    attack: 0,
    health: 0,
    sick: true,
    played: false,
    reversed: false,
    used: false,
    invenomed: false,
    transfusion: false,
    vampirism: false,
    berserker: false
  },
  setSick: function(value) {
    this.set({'sick': value});
  },
  setUsed: function(value) {
    this.set({'used': value});
  },
  setPlayerId: function(playerId) {
    this.set({'playerId': playerId});
  },
  setInvenomed: function(value) {
    this.set({'invenomed': value});
  },
  update: function(card) {
    if (card.hasOwnProperty('sick')) {
      this.set({'sick': card.sick});
    }
    if (card.hasOwnProperty('used')) {
      this.set({'used': card.used});
    }
    if (card.hasOwnProperty('invenomed')) {
      this.set({'invenomed': card.invenomed});
    }
    if (card.hasOwnProperty('health')) {
      this.set({'health': card.health});
    }
  }
});
