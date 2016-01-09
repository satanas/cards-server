var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/magic', function(err, db) {
  if(err) throw err;

  console.log("Connected to DB");

  populateSingleValues(db, ["player", "card", "self", "hand", "any"],
                       'target_types');
  populateSingleValues(db, ["undamaged", "damaged", "class", "any"],
                       'target_conditions');
  populateSingleValues(db, ["friend", "foe", "any"],
                       'target_bands');
  populateSingleValues(db, ["no", "yes", "random"],
                       'target_selects');
  populateSingleValues(db, ["play", "turn", "damage_received", "damage_dealt", "dead"],
                       'events');
  populateSingleValues(db, ["health", "attack"],
                       'mod_attributes');
  populateSingleValues(db, ["add", "replace", "mult"],
                       'mod_operations');
  populateSingleValues(db, ["attribute", "ability", "draw", "damage", "summon", "transform", "protect_card",
                            "disenchant", "return", "necromancy", "kill_target", "player_health", "freeze",
                            "protect_player", "mana_cost"],
                       'mod_spells');
  populateSingleValues(db, ["firststrike", "rush", "overwhelm", "deathtouch", "venom", "transfusion",
                            "vampirism", "berserker", "stealth", "faint", "provoke"],
                       'mod_abilities');
  populateSingleValues(db, ["controlled_creatures", "enemy_creatures"],
                       'mod_multipliers');

  db.close();
});

function populateSingleValues(db, arr, label) {
  var col = db.collection(label);
  col.remove({});
  console.log(`Cleaned ${label}`);

  arr.forEach(function(type) {
    col.insert({
      name: type,
      value: type
    });
  });
  console.log(`Populated ${label} with ${arr.length} records`);
}
