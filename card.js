function Card(id, type, attack, health, name, image, mana, description, flying, firstStrike, vigilance, haste, trample, shadow) {
  this.id = id;
  this.type = type;
  this.attack = attack;
  this.health = health;
  this.name = name;
  this.image = image;
  this.mana = mana;
  this.description = description;
  this.firstStrike = firstStrike || false; // Attack first, can survive if the other is killed
  this.haste = haste || false; // Attack when drawn
  this.trample = trample || false; // Do damage even when blocked
  this.sick = (this.haste) ? false : true;
  this.used = false;

  this.attrs = [];
  //this.infects
  //this.vigilance = vigilance || false;
  //this.flying = flying || false; // Can only be blocked by flying
  //this.shadow = shadow || false;
};

module.exports = Card;
