var ModificationModel = Backbone.Model.extend({
  defaults: {
    spell: '',
    attribute: '',
    operation: '',
    ability: '',
    multiplier: '',
    value: ''
  },
  validate: function() {
    $.ajax('/modifications/validate', {
      data: JSON.stringify(this.toJSON()),
      method: 'POST',
      processData: false,
      contentType: false,
      context: this,
      success: function(data) {
        this.trigger('validated', null, data);
      },
      error: function(data) {
        this.trigger('validated', data.responseJSON.errors);
      }
    });
  },
  compare: function(obj) {
    if (obj.spell === 'draw' && obj.spell === this.get('spell')) return true;

    var equal = true;
    for (var attr in obj.attributes) {
      equal = equal && this.get(attr) === obj.get(attr);
    }
    return equal;
  }
});
