var Card = function(id, type, attack, health, name, image, mana, description, abilities) {
  this.id = id;
  this.type = type;
  this.attack = attack;
  this.health = health;
  this.name = name;
  this.image = image;
  this.mana = mana;
  this.description = description;
  abilities = abilities || {};

  // Abilities:
  // Attack first, can survive if the other is killed
  this.firstStrike = abilities.firstStrike || false;
  // Attack when played
  this.rush = abilities.rush || false;
  // Inflicts the non-blocked damage to the player (only when attacking)
  this.overwhelm = abilities.overwhelm || false;
  // If creature with deathtouch dies, the attacking creature also dies
  this.deathtouch = abilities.deathtouch || false;
  // Invenom any creature that deals damage. Invenomed creature lose 1 health every turn until it dies
  this.venom = abilities.venom || false;
  // Props
  this.sick = true;
  this.used = false;
  this.played = false;
  this.invenomed = false;

  this.attrs = [];
  //this.flying = flying || false; // Can only be blocked by flying
  //this.shadow = shadow || false;
  //berserker: attacks twice
  //unholy: can't be target of spells or abilities
  //provoke: enemy can't attack other creatures
  //stealth: can't be targeted until it attacks
};

Card.prototype.constructor = Card;

module.exports = Card;
