var EnchantmentFormView = Backbone.View.extend({
  el: '#enchantment-div',
  initialize: function(options) {
    this.template = Handlebars.compile($('#enchantment-form-template').html());
    this.model.on('change', this.onChange, this);
    this.model.on('modifications-updated', this.renderModifications, this);
    this.render();

    //$('[data-belongs-to="enchantment"]').on('keyup', function(ev) {
    //  console.log(this.model);
    //  this.model.update($('#enchantment_form').serializeObject());
    //  console.log('up', this.model.toJSON());
    //}.call(this));
  },
  onChange: function() {
    this.render();
    $('#add_modification_button').on('click',addModification);
    $('#add_enchantment_button').on('click', addEnchantment);

    //$('[data-belongs-to="enchantment"]').on('keyup', function(ev) {
    //  console.log(this.model);
    //  this.model.update($('#enchantment_form').serializeObject());
    //  console.log('up', this.model.toJSON());
    //}.call(this));
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  },
  renderModifications: function() {
    var table = '';
    this.model.toJSON().mods.forEach(function(m) {
      table += '<tr>' +
        '  <td>' + m.spell + '</td>' +
        '  <td>' + m.attribute + '</td>' +
        '  <td>' + m.operation + '</td>' +
        '  <td>' + m.ability + '</td>' +
        '  <td>' + m.multiplier + '</td>' +
        '  <td>' + m.value + '</td>' +
        '  <td><a href="#">Delete</a></td>' +
        '</tr>';
    });
    $('#mods_table').html(table);
  }
});
