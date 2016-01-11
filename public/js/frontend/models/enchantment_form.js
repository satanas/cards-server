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
  }
});
