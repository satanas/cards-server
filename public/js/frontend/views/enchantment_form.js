var EnchantmentForm = Backbone.View.extend({
  el: '#enchantment-div',
  initialize: function(options) {
    console.log('init enchantment form');
    this.template = Handlebars.compile($('#enchantment-form-template').html());
    this.model.on('change', this.render, this);
    this.render();
  },
  render: function() {
    console.log(this.model.toJSON());
    this.$el.html(this.template(this.model.toJSON()));
  }
});
