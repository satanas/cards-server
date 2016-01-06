var _ = require('underscore');

module.exports = function(card) {
  card._id = null;
  card.types = [
    {
      name: "Creature",
      value: 2,
      selected: true
    },
    {
      name: "Spell",
      value: 1
    }
  ];
  var abilities = ['rush', 'overwhelm', 'firstStrike', 'deathtouch', 'venom', 'transfusion', 'vampirism', 'berserker'];
  card.abilities = [];

  abilities.forEach(function(key) {
    values = _.map([true, false], function(v) {
      return {
        name: v.toString(),
        value: v,
        selected: (card[key] && v) || false
      };
    });

    card.abilities.push({
      name: key,
      values: values
    });
  });

  return card;
};
