var Player = Backbone.Model.extend({
  defaults: {
    id: null,
    health: 0,
    totalMana: 0,
    usedMana: 0
  },
  receiveDamage: function(value, health) {
    this.set({health: health});
    this.trigger('receive-damage', value);
  },
  receiveHealth: function(value, health) {
    this.set({health: health});
    this.trigger('receive-health', value);
  }
});
