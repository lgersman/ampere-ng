"use strict";
	// iife wrapper
(function() {
	console.log("huhu!!");

	Polymer({
		stringify : JSON.stringify,

		publish : {
			items : [{name : 'default'}]
		},

		attached: function() {
			this.template = this.querySelector('template');
			if(this.template) {
				!this.template.bindingDelegate && (this.template.bindingDelegate = this.element.syntax);
				this.shadowRoot.appendChild(this.template.createInstance(this));
				//this.template.model = this.items;
				//this.template.setAttribute('bind', '{{items.length as length}}');
			}
		},

		onClicked : function() {
			this.items.push({name : 'foo'});
			//this.items = [].concat(this.items);
		},

		itemsChanged: function() {
			console.log("items changed", arguments);
		}
	});
})();
