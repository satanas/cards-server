var Card = function(id, type, attack, health, name, image, mana, description, flying, firstStrike, vigilance, rush, overwhelm, deathtouch, shadow) {
  this.id = id;
  this.type = type;
  this.attack = attack;
  this.health = health;
  this.name = name;
  this.image = image;
  this.mana = mana;
  this.description = description;
  this.firstStrike = firstStrike || false; // Attack first, can survive if the other is killed
  this.rush = rush || false; // Attack when drawn
  this.overwhelm = overwhelm || false; // Inflicts the non-blocked damage to the player
  this.deathtouch = deathtouch || false; // If creature with deathtouch dies, the attacking creature also dies
  this.sick = (this.rush) ? false : true;
  this.used = false;
  this.drawed = false;

  this.attrs = [];
  //this.infects
  //this.vigilance = vigilance || false; Can be renamed to provoke
  //this.flying = flying || false; // Can only be blocked by flying
  //this.shadow = shadow || false;
  //berserker
};

module.exports = Card;
