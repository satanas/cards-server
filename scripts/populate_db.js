var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/magic', function(err, db) {
  if(err) throw err;

  console.log("Connected to DB");

  populateSingleValues(db, ["n/a", "player", "card", "self", "hand", "any"], 'target_types');
  populateSingleValues(db, ["n/a", "undamaged", "damaged", "class", "any"], 'target_conditions');
  populateSingleValues(db, ["n/a", "friend", "foe", "any"], 'target_bands');
  populateSingleValues(db, ["no", "yes", "random"], 'target_selects');
  populateSingleValues(db, ["play", "turn", "damage_received", "damage_dealt", "dead"], 'events');
  populateSingleValues(db, ["n/a", "health", "attack"], 'mod_attributes');
  populateSingleValues(db, ["n/a", "add", "replace", "mult"], 'mod_operations');

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
