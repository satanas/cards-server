var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
 
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeST__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

var CARD_DETAILS_TIMEOUT = 600;
var abilitiesDescription = {
  'firstStrike': "Card with first strike will attack first, if the other card is killed then it won't receive any damage.",
  'rush': "Can attack on the first turn (immediately after being played).",
  'overwhelm': "Inflicts to the opponent player the remaining damage not received by the defending card.",
  'deathtouch': "A creature with deathtouch will always kill its opponent, regarding the health it could has",
  'curse': "When this creature dies, the other creature also dies.",
  'venom': "Invenoms attacking creatures. Invenomed creatures will lose 1 health every turn.",
  'transfusion': "Recover +1 health to the controlling player for each creature this card kills.",
  'vampirism': "Recover +1 health to itself for each creature this card kills.",
  'berserker': "Can attack two times in the same turn.",
  'stealth': "Can't be attacked until it attacks the first time.",
  'faint': "Indicate how many turns this creature will fight until it dies. In each turn, the faint counter is decreased until it gets to zero.",
  'provoke': "If a card has provoke, then the attacking player could not attack other creatures except the ones with provoke."
}
var IMAGES_PATH = '/public/images/';

function showMessage(type, message) {
  $('body').prepend('<div data-alert class="alert-box ' + type + ' radius">' + message + '</div>');
  setTimeout(function() {
    $('.alert-box').fadeOut({
      duration: 400,
      complete: function() {
        $('.alert-box').remove();
      }
    });
  }, 2000)
}
