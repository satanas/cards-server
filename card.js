function Card(type, attack, defense, name, image, mana, description, flying, firstStrike, vigilance, haste, trample, shadow) {
  this.type = type;
  this.attack = attack;
  this.defense = defense;
  this.name = name;
  this.image = image;
  this.mana = mana;
  this.description = description;
  this.flying = flying;
  this.firstStrike = firstStrike;
  this.vigilance = vigilance;
  this.haste = haste;
  this.trample = trample;
  this.shadow = shadow;
  //this.infects
};

module.exports = Card;
