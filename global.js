module.exports = {
  cardTypes: {
    'ARTIFACT': 0,
    'CREATURE': 1,
    'ENCHANTMENT': 2,
    'INSTANT': 3,
    'SORCERY': 4
  },
  ERRORS: {
    'NO_MANA': -1,
    'CARD_NOT_FOUND': -2
  },
  MAX_MANA: 10,
  MAX_HEALTH: 10,
  MATCH_STATUS: {
    'Open': 0,
    'Starting': 1,
    'Started': 2,
    'Ended': 3
  },
  ABILITIES: ['rush', 'overwhelm', 'firstStrike', 'deathtouch', 'venom', 'transfusion', 'vampirism', 'berserker',
    'curse', 'endurance']
}

