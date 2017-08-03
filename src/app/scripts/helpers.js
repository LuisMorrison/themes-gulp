/*
 *  HELPERS.JS
 *  Luis Morrison @ Kichink
 *  Junio 2015
 */

Number.prototype.formatCurrency = function(c, d, t) {
	var n = this,
		c = isNaN(c = Math.abs(c)) ? 2 : c,
		d = d == undefined ? "." : d,
		t = t == undefined ? "," : t,
		s = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

String.prototype.toTitleCase = function () {
	return this.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function isEmpty(str) {
    return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
}

(function($){
    $.isBlank = function(string) {
        return(!string || $.trim(string) === "");
    };
})(jQuery);
