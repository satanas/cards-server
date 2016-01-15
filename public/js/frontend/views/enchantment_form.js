var EnchantmentFormView = Backbone.View.extend({
  el: '#enchantment-div',
  events: {
    'click #show_modification_form_button': 'showModificationForm',
    'click #cancel_enchantment_button': 'hideEnchantmentForm',
    'click #cancel_modification_button': 'hideModificationForm',
    'click #save_modification_button': 'addModification',
    'click #save_enchantment_button': 'addEnchantment'
  },
  initialize: function(options) {
    this.template = Handlebars.compile($('#enchantment-form-template').html());
    this.model.on('modifications-updated', this.renderModifications, this);
    this.render();
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  },

  renderModifications: function() {
    var table = '';
    console.log('this model', this.model.toJSON());
    this.model.toJSON().mods.forEach(function(m, i) {
      table += '<tr>' +
        '  <td>' + m.spell + '</td>' +
        '  <td>' + m.attribute + '</td>' +
        '  <td>' + m.operation + '</td>' +
        '  <td>' + m.ability + '</td>' +
        '  <td>' + m.multiplier + '</td>' +
        '  <td>' + m.value + '</td>' +
        '  <td><a href="#" class="delete-mod" data-id="' + i + '">Delete</a></td>' +
        '</tr>';
    });
    $('#mods_table').html(table);
    $('.delete-mod').on('click', this.deleteModification);
  },
  addEnchantment: function(ev) {
    ev.preventDefault();
    clearErrors();

    // TODO: Validate
    newEnchantment.update($('#enchantment_form').serializeObject());
    console.log('serializeObject', $('#enchantment_form').serializeObject());
    console.log('addEnchantment', newEnchantment.toJSON());
    cardModel.addEnchantment(newEnchantment.toJSON());
    console.log('cardModel', cardModel.toJSON());
    this.hideEnchantmentForm();
  },
  addModification: function(ev) {
    ev.preventDefault();
    clearErrors();

    var mod = new ModificationModel($('#modification_form').serializeObject());
    mod.on('validated', function(err, data) {
      if (err) return highlightErrors(err);

      this.model.addModification(data);
      this.hideModificationForm();
    }.bind(this));

    mod.validate();
    return false;
  },
  showModificationForm: function() {
    $('#enchantment_form_buttons').hide();
    $('#modification_form').show();
  },
  hideModificationForm: function() {
    $('#enchantment_form_buttons').show();
    $('#modification_form').hide();
    $('#modification_form').trigger('reset');
  },
  hideEnchantmentForm: function() {
    newEnchantment.reset();
    $('#enchantment_modal').foundation('reveal', 'close');
    $('#modification_form').trigger('reset');
    $('#enchantment_form').trigger('reset');
    $('#mods_table').html('');
  },
  deleteModification: function(ev) {
    console.log('delete', $(this).attr('data-id'));
  }
});
