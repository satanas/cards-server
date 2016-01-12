var EnchantmentFormView = Backbone.View.extend({
  el: '#enchantment-div',
  initialize: function(options) {
    this.template = Handlebars.compile($('#enchantment-form-template').html());
    this.model.on('change', this.onChange, this);
    this.render();
  },
  onChange: function() {
    this.render();
    $('#add_modification_button').on('click',addModification);
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  }
});
