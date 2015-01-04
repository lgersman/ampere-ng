"use strict";
	// iife wrapper
(function() {
	Polymer({
		created : function() {

		},
		attached : function() {
			var template = this.querySelector("template");
			if(template) {
				!template.bindingDelegate && (template.bindingDelegate = this.element.syntax);
				this.shadowRoot.appendChild(template.createInstance(this));
			}
			this.unpromisify(this.transition, "disabled");
		},
		disabled : true,
			/**
			* unpromisify will convert a promise
			*
			* obj the model to get a promise from
			* objPropertyName the name of the model property returning the promise
			* elementPropertyName (optional) the elements property to set
			* reset (optional) the value to set the elements property to until the promise is resolved
			*/
		unpromisify : function(obj, objPropertyName, elementPropertyName, reset) {
			!elementPropertyName && (elementPropertyName=objPropertyName);
			arguments.length===3 && (this[elementPropertyName]=reset);
			this.transition.log( "unpromisify() : reset this['" + elementPropertyName + "'] to " + reset);

			obj[objPropertyName].then(
				function(val) {
					this.transition.log( "unpromisify() : set this['" + elementPropertyName + "'] from " + this[elementPropertyName] + " to " + !!val);
					this[elementPropertyName] = !!val;
				}.bind(this),
				function(ex) {
					this[elementPropertyName] = val;
				}.bind(this)
			);
		},
		execute : function(event) {
			this.transition.state.module.app.execute(this.transition, event);
		}
	});
})();
