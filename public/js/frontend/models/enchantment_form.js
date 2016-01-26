var EnchantmentFormModel = Backbone.Model.extend({
  defaults: {
    description: null,
    event: null,
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
    this.get('mods').push(mod);
    this.trigger('modifications-updated');
  },
  updateModifications: function(mods) {
    var mods = this.set('mods', mods);
    this.trigger('modifications-updated');
  },
  update: function(data) {
    var obj = {
      description: data.description,
      event: data.event,
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
  validate: function(callback) {
    $.ajax('/enchantments/validate', {
      data: JSON.stringify(this.toOutput()),
      method: 'POST',
      processData: false,
      contentType: false,
      context: this,
      success: function(data) {
        callback(null, data);
      },
      error: function(data) {
        callback(data.responseJSON.errors);
      }
    });
  },
  toOutput: function() {
    var output = this.toJSON();
    // Cleaning up form attribute
    if (output.hasOwnProperty('form')) delete output.form;
    return output;
  },
  reset: function() {
    this.set({
      description: null,
      event: null,
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
