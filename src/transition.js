import {Diary} from '../lib/diary/diary';
Diary.logger('transition').info( "loaded");

import Base from "./base";
import Constants from "./constants";

const defaultTransaction = (transition,...args)=>{
		let undo, redo=()=>undo;

		return (undo=()=>redo);
	},
	defaultDisabled = transition=>false
;

function value2Function(value) {
	return transition=>value;
}

/**
	Transition is a directed connection to move the current application state to another State.
*/
export default class Transition extends Base {
		/**
			* @param state state or function returning state
			* @param viewOrCb target view or function returning the target view
		*/
	constructor(state, name:string, cb:Function, viewOrCb) {
			// manual type assertion
		if(state instanceof State) {
			assert.argumentTypes(state, State, name, $traceurRuntime.type.string, cb, Function, viewOrCb, View);
		} else {
			assert.argumentTypes(state, Module, name, $traceurRuntime.type.string, cb, Function, viewOrCb, viewOrCb instanceof View ? View : Function);
		}

		super(name, 'transition', state.options);

		if(state instanceof State) {
			Object.defineProperties(this, {
				'state' : {
					value	   : state,
					writable : false
				},
			});
		} else if(state instanceof Module) {
			let module = state;
			Object.defineProperties(this, {
				'module' : {
					value			: module,
					writable 	: false
				},
				'state' : {
					get				: ()=>((module.app || {}).view || {}).state,
					configurable : false
				}
			});
		} else {
			this.assert( false, '1st argument expected to be a State or Module');
		}

		let _disabled, _transaction;
		Object.defineProperties(this, {
			'view' : {
				get      : (viewOrCb instanceof View) ? value2Function(viewOrCb) : viewOrCb,
				configurable : false
			},
			'disabled' : {
				set    	: disabled=>{
						// optimiziation : if disabled is a function
					if(typeof(disabled)==='function') {
							// wrap it in a function doing the reuest everytime new
						_disabled = ()=>{
							return new Promise((resolve, reject)=>{
								try {
									Promise.resolve(disabled(this)).then(resolve, reject);
								} catch(ex) {
									reject(ex);
								}
							});
						};
					} else {
							// return always the same Promise for it
						let promise = new Promise((resolve, reject)=>{
							try {
								Promise.resolve(disabled).then(resolve, reject);
							} catch(ex) {
								reject(ex);
							}
						});
						_disabled = ()=>promise;
					}
				},
				get			: ()=>_disabled(),
				configurable : false
			},
			'transaction' : {
				set			 : transaction=>{
						// TODO : Function type as argument doesnt work with traceur yet
						// thats why we call assert manually
					assert.argumentTypes(transaction, Function);

					_transaction = (...args)=>{
						return new Promise((resolve, reject)=>{
							try {
								return Promise.resolve(transaction(this, ...args)).then(resolve, reject);
							} catch(ex) {
								reject(ex);
							}
						});
					};
				},
				get			: ()=>_transaction,
				configurable : true
			}
		});

		this.disabled = defaultDisabled;
		this.transaction = defaultTransaction;

		this.options[Base._PROMISIFY](cb);
	}
}

import State from "./state";
import View from "./view";
import Module from "./module";
