// http://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm
Array.prototype.shuffle = function() {
  var j, temp;
  for (var i = this.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
};

Array.prototype.clone = function() {
  return this.slice(0);
}

// Returns a random number between min and max (inclusive)
Math.randomint = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
