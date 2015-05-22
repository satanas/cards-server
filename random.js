var shuffle = function(array) {
  var j, temp;
  for (var i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

// Returns a random number between min and max (inclusive)
var integer = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.shuffle = shuffle;
exports.integer = integer;
