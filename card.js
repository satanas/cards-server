function Card(id, type, attack, defense, name, image, mana, description, flying, firstStrike, vigilance, haste, trample, shadow) {
  this.id = id;
  this.type = type;
  this.attack = attack;
  this.defense = defense;
  this.name = name;
  this.image = image;
  this.mana = mana;
  this.description = description;
  this.flying = flying || false;
  this.firstStrike = firstStrike || false;
  this.vigilance = vigilance || false;
  this.haste = haste || false;
  this.trample = trample || false;
  this.shadow = shadow || false;
  this.attrs = [];
  //this.infects
};

module.exports = Card;
