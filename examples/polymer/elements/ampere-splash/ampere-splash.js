"use strict";
/**
	 wraps an ampere-app including its splash screen
*/
	// iife wrapper
(function() {
	Polymer({
		attached : function() {
			var template = this.querySelector("template");
			if(template) {
				!template.bindingDelegate && (template.bindingDelegate = this.element.syntax);
				this.shadowRoot.appendChild(template.createInstance(this));
			}
		}/*,
		_domReady : function() {
			var template = this.querySelector("template");
			if(template) {
				this.shadowRoot.appendChild(template.createInstance());
			}
		}*/,
		appChanged : function(oldApp,app) {
			if(app) {
				if(oldApp) {
					throw new Error("app is already set and can only set once");
				}

				//Object.defineProperty( app

					// track promise state of the app
				app.promise.then(
					function(value) {
						this.async(function() {
							this.state = 'fullfilled';
						});
					}.bind(this),
					function(error) {
						this.async(function() {
							this.state = 'rejected';
						});
					}.bind(this)
				);
			}
		},
		state : 'pending'
	});
})();
