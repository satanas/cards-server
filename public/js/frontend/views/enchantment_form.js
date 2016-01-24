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
    $('.delete-mod').on('click', { ctx: this }, this.deleteModification);
  },
  addEnchantment: function(ev) {
    ev.preventDefault();
    clearErrors('#enchantment_form');

    // TODO: Validate
    newEnchantment.update($('#enchantment_form').serializeObject());
    newEnchantment.validate(function(err, data) {
      if (err) return highlightErrors(err, '#enchantment_form');

      cardModel.addEnchantment(newEnchantment.toOutput());
      this.hideEnchantmentForm();
    }.bind(this));
  },
  addModification: function(ev) {
    ev.preventDefault();
    clearErrors('#modification_form');

    var mod = $('#modification_form').serializeObject();
    var errors = new Validator().validateModifications(mod);
    if (errors.length > 0) {
      return highlightErrors(errors);
    } else {
      this.model.addModification(mod);
      this.hideModificationForm();
    }
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
    clearErrors('#enchantment_modal');
    newEnchantment.reset();
    $('#enchantment_modal').foundation('reveal', 'close');
    $('#modification_form').trigger('reset');
    $('#enchantment_form').trigger('reset');
    $('#mods_table').html('');
  },
  deleteModification: function(ev) {
    var ctx = ev.data.ctx,
        mods = ctx.model.toJSON().mods;

    mods.splice(parseInt($(this).attr('data-id')), 1);
    ctx.model.updateModifications(mods);
  }
});
