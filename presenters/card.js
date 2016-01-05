module.exports = function(card) {
  card._id = null;
  card.abilities = [
    {
      name: 'rush',
      value: card.rush || false
    },
    {
      name: 'overwhelm',
      value: card.overwhelm || false
    },
    {
      name: 'firstStrike',
      value: card.firstStrike || false
    },
    {
      name: 'deathtouch',
      value: card.deathtouch || false
    },
    {
      name: 'venom',
      value: card.venom || false
    },
    {
      name: 'transfusion',
      value: card.transfusion || false
    },
    {
      name: 'vampirism',
      value: card.vampirism || false
    },
    {
      name: 'berserker',
      value: card.berserker || false
    }
  ];
  return card;
};
