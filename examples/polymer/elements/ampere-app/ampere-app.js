"use strict";
	// iife wrapper
(function() {
		/**
		* Polymer specific execute function
		*
		* @see App.execute
		*/
	function appExecutor(transition,setView/*, ...params*/) {
		var host = this,
				app = transition.state.module.app,
				transaction = transition.transaction,
				params = Array.prototype.slice.call(arguments, 2),
					// this is just for shorter code
				Ampere = window.Ampere.default
		;
		app.ui('block');
		app.ui('flash', "Executing transition " + transition.name);

		//k(null, "huhu", { actions : [{ "AMPERE_UI_CAPTION" : 'Cancel', "AMPERE_UI_ICON" : 'menu'}, { "AMPERE_UI_CAPTION" : 'Retry'}], error  : true})

			// execute transition transaction
		var promise = transaction.apply(this, params);

			// execute redo operation
		promise = promise.then(
			function(redo) {
				if(typeof(redo)==='function') {
					return new Promise(function(resolve, reject) {
						try {
							return Promise.resolve(redo()).then(resolve, reject);
						} catch(ex) {
							reject(ex);
						}
					});
				}
			}
		);

			// set view when redo operation is ready
		promise = promise.then(
			function(undo) {
					// wait for transition view to be ready
				return transition.view.promise.then(function() {
						setView(transition.view);
						app.ui('unblock');
						if(typeof(undo)==='function') {
							var _undo = function() {
								undo();
								alert("undoed");
								app.ui('unblock');
								app.ui('flash', "Transition undo'ed");
							}
							_undo[Ampere.UI.CAPTION]='Undo';
							_undo[Ampere.UI.ICON]='undo';

							//app.ui('flash', '', { actions : _undo});
						} else {
							//app.ui('flash');
						}

						return undo;
				});
			},
			function(ex) {
				if(ex instanceof Error) {
					return new Promise(function(resolve,reject) {
						var cancel = function() {
							app.ui('unblock');
							app.ui('flash', 'Transition aborted');
							alert("canceled");
							reject(undefined);
						};
						cancel[Ampere.UI.CAPTION]='Cancel';
						cancel[Ampere.UI.ICON]='cancel';

						var retry = function() {
							alert("retried");
							resolve("Subber");
						};
						retry[Ampere.UI.CAPTION]='Retry';
						retry[Ampere.UI.ICON]='autorenew';
							// TODO : set title element of document ??

						app.ui('flash',	ex.message || 'Error occured', { actions : [cancel, retry], error : ex});
					});
				} else {
					return Promise.reject(undefined);
				}
			}
		);

		return promise;
	}

		// the symbol to use as key for the internal ui actions
	var UI_ACTIONS = Symbol('UI_ACTIONS');

		/**
		*
		*/
	function appUiInterface(element/*:ampere-app*/,app/*:App*/,action/*:string*//*,...args*/) {
		app.assert(typeof(action)==='string' && action.length>0, 'app.ui(action,...args) : action is required to be non empty string but was "' + action +  '"');

		var args =  Array.prototype.slice.call(arguments, 3);

		var fnName, fn;
			// arguments available : try to evaluate setter function
		if(args.length) {
			fnName = 'set' + action[0].toUpperCase() + action.substring(1);
			fn = element[UI_ACTIONS]['get' + action[0].toUpperCase() + action.substring(1)];
		} else {
			fnName = 'get' + action[0].toUpperCase() + action.substring(1);
			fn = element[UI_ACTIONS]['get' + action[0].toUpperCase() + action.substring(1)];
		}

		if(!fn) {
			fn = element[UI_ACTIONS][action];

			if(typeof(fn)!=='function') {
				if(args.length) {
						// setter
					throw new Error('app.ui(action,...) : neither ui function "' + action + '" nor setter "' + fnName + '" found.');
				} else {
						// getter
					throw new Error('app.ui(action) : neither ui function "' + action + '" nor getter "' + fnName + '" found.');
				}
			}

			args.unshift(app);

			return fn.apply(this, args);
		}
	}

	var ElementDefinition = {
		attached : function() {
			var template = this.querySelector("template");
			if(template) {
				!template.bindingDelegate && (template.bindingDelegate = this.element.syntax);
				this.shadowRoot.appendChild(template.createInstance(this));
			}
		},
		appChanged : function(o,app) {
				// override execute function
			app.execute = appExecutor.bind(this);
				// bridge ui into app
			app.ui = appUiInterface.bind(this, this);

			var progressAction = function(app, param) {
				if(arguments.length===1) {
					this.$.progress.indeterminate = false;
					this.$.progress.secondaryProgress = 0;
					this.$.progress.value = 0;
					this.$.progressTooltip.disabled = true;
				} else if(typeof(param)==='number') {
					this.app.assert(param>=0 && param<=100, 'ui("progress", <number>) : number argument expected to be >=0 && <=100) but was ' + param);
					this.$.progress.indeterminate = false;
					this.$.progress.value = param;
				} else if(typeof(param)==='string') {
					this.app.assert(param==='indeterminate', 'ui("progress", string) : string argument expected to be "indeterminate" but was "' + param + '"');
					this.$.progress.value = 0;
					this.$.progress.indeterminate = param;
				} else if(typeof(param)==='object') {
					param.hasOwnProperty('value') && progressAction(app, param.value);
					param.hasOwnProperty('secondaryProgress') && (this.$.progress.secondaryProgress = param.secondaryProgress);
					if(param.hasOwnProperty('description')) {
						this.$.progressTooltip.disabled = !(this.$.progressTooltip.label = param.description);
						if(!this.$.progressTooltip.disabled) {
							this.$.progressTooltip.show=true;
							this.job(
								'progress.hideTooltip',
								function() {
									this.$.progressTooltip.show=false;
								},
								4000
							);
						}
					}
				} else {
					this.app.assert(param==='indeterminate', 'ui("progress", arg?) : argument arg expected to be of type string, number or object but was "' + param + '"');
				}
			}.bind(this);

			this.registerUIAction("progress", window.p = function(app,param){
				var args = arguments;
				this.job(
					'progress',
					function() {
						progressAction.apply(this, args);
					}.bind(this),
					200
				);
			}.bind(this));
		},
		registerUIAction : function(action, fn/*:Function*/) {
			this.app.assert(typeof(action)==='string' && typeof(fn)==='function', 'app.registerUIAction(action,fn) : action is required to be non empty string but was "' + action +  '" and 2nd argument expected to be an function');

			this.app.assert(this[UI_ACTIONS][action]===undefined, 'app.registerUIAction(action,fn) : action(=" + action + ") is already registered');

				// TODO : must be per instance instance
			this[UI_ACTIONS][action] = fn;
		}
		/*,
		computed : {
			view : 'app.view'
		}*/
	};
	ElementDefinition[UI_ACTIONS] = {};

	Polymer(ElementDefinition);
})();
