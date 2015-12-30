module.exports = function(card, isNew) {
  card.abilities = [
    {
      name: 'rush',
      value: card.rush
    },
    {
      name: 'overwhelm',
      value: card.overwhelm
    },
    {
      name: 'firstStrike',
      value: card.firstStrike
    },
    {
      name: 'deathtouch',
      value: card.deathtouch
    },
    {
      name: 'venom',
      value: card.venom
    },
    {
      name: 'transfusion',
      value: card.transfusion
    },
    {
      name: 'vampirism',
      value: card.vampirism
    },
    {
      name: 'berserker',
      value: card.berserker
    }
  ];
  card.isNew = isNew;
  return card;
};
