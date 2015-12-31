var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
 
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeST__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};

var CARD_DETAILS_TIMEOUT = 600;
var abilitiesDescription = {
  'firstStrike': "Card with first strike will attack first, if the other card is killed then it won't receive any damage.",
  'rush': "Can attack on the first turn (immediately after being played).",
  'overwhelm': "Inflicts to the opponent player the remaining damage not received by the defending card.",
  'deathtouch': "When this creature dies, the other creature also dies.",
  'venom': "Invenoms attacking creatures. Invenomed creatures will lose 1 health every turn.",
  'transfusion': "Recover +1 health to the controlling player for each creature this card kills.",
  'vampirism': "Recover +1 health to itself for each creature this card kills.",
  'berserker': "Can attack two times in the same turn.",
  'stealth': "Can't be attacked until it attacks the first time.",
  'faint': "Indicate how many turns this creature will fight until it dies. In each turn, the faint counter is decreased until it gets to zero.",
  'provoke': "If a card has provoke, then the attacking player could not attack other creatures except the ones with provoke."
}
