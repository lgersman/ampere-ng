"use strict";
	// iife wrapper
(function() {
	Polymer({
		open : function() {
			this.opened = true;
		},
		close : function() {
			this.opened = false;
		},
		publish : {
			opened : {
				value : false,
				reflect : true
			}
		}
	});
})();
