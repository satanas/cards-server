var EnchantmentFormModel = Backbone.Model.extend({
  defaults: {
    id: null,
    description: null,
    event: {
     on: null
    },
    target: {
      select: null,
      type: null,
      condition: null,
      band: null,
      class: null,
      quantity: null
    },
    mods: [
    ],
    form: {
      event: {},
      target: {},
      mod: {}
    }
  },
  addModification: function(mod) {
    var mods = this.get('mods').push(mod);
    this.trigger('modifications-updated');
  },
  update: function(data) {
    var obj = {
      description: data.description,
      event: {
        on: data.event
      },
      target: {
        select: data.select,
        type: data.type,
        condition: data.condition,
        band: data.band,
        class: data.class,
        quantity: data.quantity
      }
    }
    this.set(obj);
  },
  reset: function() {
    this.set({
      description: null,
      event: {
       on: null
      },
      target: {
        select: null,
        type: null,
        condition: null,
        band: null,
        class: null,
        quantity: null
      },
      mods: []
    });
  }
});
