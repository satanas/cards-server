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
    this.modificationFormId = '#modification_form';
    this.enchantmentFormId = '#enchantment_form';
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
    clearErrors(this.enchantmentFormId);

    // TODO: Validate
    newEnchantment.update($(this.enchantmentFormId).serializeObject());
    newEnchantment.validate(function(err, data) {
      if (err) return highlightErrors(err, this.enchantmentFormId);

      cardModel.addEnchantment(newEnchantment.toOutput());
      this.hideEnchantmentForm();
    }.bind(this));
  },
  addModification: function(ev) {
    ev.preventDefault();
    clearErrors(this.modificationFormId);

    var mod = $(this.modificationFormId).serializeObject(),
        mods = this.model.toJSON().mods;

    var errors = new Validator.Modifications().validate(mod);

    for (var i=0; i < mods.length; i++) {
      var err = new Validator.Modifications().compare(mods[i], mod);
      if (err.length > 0) {
        errors = _.union(errors, err);
        break;
      }
    }

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
    $(this.modificationFormId).show();
  },
  hideModificationForm: function() {
    $('#enchantment_form_buttons').show();
    $(this.modificationFormId).hide();
    $(this.modificationFormId).trigger('reset');
  },
  hideEnchantmentForm: function() {
    clearErrors('#enchantment_modal');
    newEnchantment.reset();
    $('#enchantment_modal').foundation('reveal', 'close');
    $(this.modificationFormId).trigger('reset');
    $(this.enchantmentFormId).trigger('reset');
    $('#mods_table').html('');
  },
  deleteModification: function(ev) {
    var ctx = ev.data.ctx,
        mods = ctx.model.toJSON().mods;

    mods.splice(parseInt($(this).attr('data-id')), 1);
    ctx.model.updateModifications(mods);
  }
});
