"use strict";
	// iife wrapper
(function() {
		// Symbol key for current flash job
	var RECENT_FLASH_JOB = Symbol("RECENT_FLASH_JOB");

	var ElementDefinition = {
		created : function() {

		},
		attached : function() {
			var template = this.querySelector("template");
			if(template) {
				!template.bindingDelegate && (template.bindingDelegate = this.element.syntax);
				this.shadowRoot.appendChild(template.createInstance(this));
			}

				// contribute action to ampere-app element
			this.host.registerUIAction("block", this.block.bind(this));
			this.host.registerUIAction("unblock", this.unblock.bind(this));
				// TODO : remove window.k assoc
			this.host.registerUIAction("flash", window.k = this.flash.bind(this));

			/*
			this.$.toast.addEventListener('core-overlay-close-completed', function() {
				this.flash.options = {};
			}.bind(this));
			*/

			this.$.toast.addEventListener('core-overlay-open', function() {
					// prevent automatic dismiss if user actions are applied
				//if(this.$.toast.opened && this.flash.options.actions.length) {
					this.$.toast.dismissJob.stop();
				//}
			}.bind(this));
		},
		executeAction : function(event) {
			var action = this.flash.options && this.flash.options.actions && this.flash.options.actions[event.target.dataset.action];
			try {
					// reset options
				this.flash.options = {};

				this.host.app.assert(typeof(action)==='function', 'ampere-status.executeAction(event) : action expected to be a function');
				action();
			} catch(ex) {
				debugger
			}
		},
			// blocks the user interface
		block : function() {
			console.log("block");
			this.$.overlay.open();
		},
			// unblocks the user interface
		unblock : function() {
			console.log("unblock");
			this.$.overlay.close();
		},
			// shows a flash message
		flash : function(app, text, options) {
			if(arguments.length===1) {
				this.job(
					'flash',
					function() {
						console.log( "dismissed");
						this.$.toast.dismiss();
					},
					0
				);
			} else {
				var job = function() {
						// normalize options
					options = options || { actions : []};
						// normalize actions to array
					if(options.hasOwnProperty('actions')) {
						!Array.isArray(options.actions) && (options.actions = [options.actions]);
					} else {
						options.actions = [];
					}

					this.flash.options = options;
					this.$.toast.text = text;

					this.$.toast.show();
					setTimeout(function() {
							// if recent job is this job and no actions are applied
						this[RECENT_FLASH_JOB]===job && !options.actions.length && this.$.toast.dismiss();
					}.bind(this), this.$.toast.duration);
				};

					// remember current job as recent
				this[RECENT_FLASH_JOB] = job;

				this.job('flash', job, 200);
			}
		}
	};

	Polymer(ElementDefinition);
})();
