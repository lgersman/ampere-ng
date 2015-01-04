"use strict";
	// iife wrapper
(function() {
	Polymer({
		viewChanged : function(o,n) {
			console.warn("view changed" + n);

				// backup template style
			var styleElement=this.shadowRoot.querySelector("style");

				// make shardow root empty
			while(this.shadowRoot.firstChild) {
				this.shadowRoot.removeChild(this.shadowRoot.firstChild);
			}

			styleElement && this.shadowRoot.appendChild(styleElement);

			var template = this.view.template || this.$.default;
				// set bindingDelegate on template
			!template.bindingDelegate && (template.bindingDelegate = this.element.syntax);
				// append template
			this.shadowRoot.appendChild(template.createInstance(this));
		},
		computed : {
			'app'  : 'host.app',
			'view' : 'host.app.view'
		}
	});
})();
