import {Diary} from '../lib/diary/diary';
Diary.logger('history').info( "loaded");

import Base from './base';
import View from './view';
import Constants from './constants';
import App from './app';
import {spawn} from './util';

let PROPERTY_UNDO_STACK = Symbol('UNDO_STACK'),
		PROPERTY_REDO_STACK = Symbol('REDO_STACK'),
		PROPERTY_BUSY_PROMISE = Symbol('BUSY_PROMISE'),
		PROPERTY_BUSY = Symbol('BUSY')
;

function _reset() {
	let notifyCanPropertyChanges = _trackCanProperties.call(this);

	this[PROPERTY_UNDO_STACK] = [];
	this[PROPERTY_REDO_STACK] = [];

	notifyCanPropertyChanges();
}

function _when(fn:Function) {
		// since 'busy' is an synthetic property we need to notify changes manually
		// to ensure Object.observe(...) will work for property 'busy'
		// (use case polymer renderer : show always a backdrop overlay if history property 'busy'===true).

		// set busy to true
	let notifier = Object.getNotifier && Object.getNotifier(this), promise;
	if(!this[PROPERTY_BUSY]) {
		this[PROPERTY_BUSY]=true;
		notifier && notifier.notify({type: 'update', name: 'busy', oldValue: false});
	}

		// execute argument fn
	let handler = ()=>{
		return new Promise((resolve, reject)=>{
			try {
				return Promise.resolve(fn.call(this)).then(resolve, reject);
			} catch(ex) {
				reject(ex);
			}
		});
	};

	promise = this[PROPERTY_BUSY_PROMISE].then(handler, handler);

		// reset property 'busy' when promise state is finalized
	let resetbusy_handler = ()=>{
			// only if our promise is the last recent one
			// we need to take care of resetting the 'busy' property
		if(promise === this[PROPERTY_BUSY_PROMISE]) {
			this[PROPERTY_BUSY]=false;
			notifier && notifier.notify({type: 'update', name: 'busy', oldValue: true});
		}
	};
	promise.then(resetbusy_handler, resetbusy_handler);

	return this[PROPERTY_BUSY_PROMISE] = promise;
}

function _trackCanProperties() {
	let notifier = Object.getNotifier && Object.getNotifier(this);

	if(notifier) {
		let canBefore = {
			redo : this.canRedo,
			undo : this.canUndo,
			reset: this.canReset
		};

		return function notifyCanPropertyChanges() {
			let canAfter = {
				redo : this.canRedo,
				undo : this.canUndo,
				reset: this.canReset
			};

			canBefore.undo!==canAfter.undo && notifier.notify({type: 'update', name: 'canUndo', oldValue: canBefore.undo});
			canBefore.redo!==canAfter.redo && notifier.notify({type: 'update', name: 'canRedo', oldValue: canBefore.redo});
			canBefore.reset!==canAfter.reset && notifier.notify({type: 'update', name: 'canReset', oldValue: canBefore.reset});
		}.bind(this);
	} else {
		return ()=>{};
	}
}

export default class History extends Base {
	constructor(app:App) {
		var options = Object.create(app.options);

			// a little hackish : derive namespace from app namespace
			// CURIOUS : for some reason the following will not work since Base declares NAMESPACE via defineProperty :
			// options[Constants.NAMESPACE] = view.state.module.options[Constants.NAMESPACE];
		Object.defineProperty(options, Constants.NAMESPACE, {
			value : app.options[Constants.NAMESPACE]
		});

		super(app.name, 'history', options);

		let limit = options[Constants.HISTORY.LIMIT]!==undefined ? options[Constants.HISTORY.LIMIT] : Number.POSITIVE_INFINITY;
		this.assert(typeof(limit)==='number' && limit>=0, `option HISTORY.LIMIT is expected to be a positive number but was ${limit}`);

			// preset PROPERTY_BUSY_PROMISE property
		this[PROPERTY_BUSY_PROMISE] = Promise.resolve(true);
		this[PROPERTY_BUSY] = false;
		this[PROPERTY_UNDO_STACK] = [];
		this[PROPERTY_REDO_STACK] = [];
		this.reset();

		Object.defineProperties(this, {
			'app' : {
				value    : app,
				writable : false
			},
			'limit' : {
				value    : limit,
				writable : false
			},
			'busy'		 : {
				get      : ()=>this[PROPERTY_BUSY],
				configurable : false
			}
			/*,
			'size' : {
				get      : ()=>{
					return this[PROPERTY_STACK].length
				},
				configurable : false
			},
			*/
		});

			// resolve history immediately
		this.options[Base._PROMISIFY](()=>Promise.resolve(true));
	}

		// thenable interface of history
	then(onFulfilled, onRejected) {
		return this[PROPERTY_BUSY_PROMISE].then(onFulfilled, onRejected);
	}

		/**
		* @return a promise signalling that the operation was done.
		* operation is done, when current stack undo/redo operation
		* was completed (or history was idle) and all values were reset to initial.
		*/
	reset() {
		return _when.call(this, _reset);
	}

	execute(transactionWrapper:Function) {
		return _when.call(this, ()=>{
				// initialze transaction
			let promise,
					view 		= this.app.view
			;

				// wrap transaction result into promise
			promise = new Promise((resolve, reject)=>{
				try {
					return Promise.resolve(transactionWrapper()).then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			});
/*
			promise = promise.then(
				redo=>{
					if(typeof(redo)==='function') {
						return new Promise((resolve, reject)=>{
							try {
								return Promise.resolve(redo()).then(resolve, reject);
							} catch(ex) {
								reject(ex);
							}
						});
					} else {
						return Promise.resolve(redo);
					}
				},
				ex=>Promise.reject(ex)
			);
*/
			promise = promise.then(
				undo=>{
						// if history is enabled
					if(this.limit!==0) {
						let notifyCanPropertyChanges = _trackCanProperties.call(this);

							// cleanup redo stack
						this[PROPERTY_REDO_STACK].splice(0);

						if(typeof(undo)==='function') {
								// insert new undo operation
							this[PROPERTY_UNDO_STACK].push({
								fn 	 : undo,
								view : view
							});

								// remove oldest undo entry if history limit is reached
							this[PROPERTY_UNDO_STACK].length>this.limit && this[PROPERTY_UNDO_STACK].shift();
						} else {
							this[PROPERTY_UNDO_STACK] = [];
							this[PROPERTY_REDO_STACK] = [];
						}

						notifyCanPropertyChanges();
					}

					return Promise.resolve(undo);
				},
				ex=>Promise.reject(ex)
			);

			return promise;
		});
	}

	undo() {
		this.assert(this.canUndo, 'undo is disabled (canUndo===false)');
		return _when.call(this, ()=>{
			let undoStack = this[PROPERTY_UNDO_STACK],
					redoStack = this[PROPERTY_REDO_STACK]
			;

			let undoOperation = undoStack[undoStack.length-1];

				// execute undo function and wrap result into a promise
			let undoResult = new Promise((resolve, reject)=>{
				try {
					return Promise.resolve(undoOperation.fn()).then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			});

			return undoResult.then(redo=>{
					if(this.limit!==0) {
						let notifyCanPropertyChanges = _trackCanProperties.call(this);

							// remove operation from undo stack
						undoStack.pop();

						if(typeof(redo)==='function') {
							redoStack.push({
								fn 	 : redo,
								view : this.app.view
							});

								// remove oldest redo operation if redo count > limit
							if(redoStack.length>this.limit) {
								redoStack.shift();
							}

							notifyCanPropertyChanges();
						}
					} else {
						this[PROPERTY_UNDO_STACK] = [];
						this[PROPERTY_REDO_STACK] = [];
					}

					return redo;
				},
				ex=>Promise.reject(ex)
			);
		});
	}

	redo() {
		this.assert(this.canRedo, 'redo is disabled (canRedo===false)');
		return _when.call(this, ()=>{
			let undoStack = this[PROPERTY_UNDO_STACK],
					redoStack = this[PROPERTY_REDO_STACK]
			;

			let redoOperation = redoStack[redoStack.length-1];

				// execute undo function and wrap result into a promise
			let redoResult = new Promise((resolve, reject)=>{
				try {
					return Promise.resolve(redoOperation.fn()).then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			});

			return redoResult.then(
				undo=>{
					if(this.limit!==0) {
						let notifyCanPropertyChanges = _trackCanProperties.call(this);

							// remove operation from redo stack
						redoStack.pop();

						if(typeof(undo)==='function') {
							undoStack.push({
								fn 	 : undo,
								view : this.app.view
							});

								// remove oldest undo operation if undo count > limit
							if(undoStack.length>this.limit) {
								undoStack.shift();
							}
						} else {
							this[PROPERTY_UNDO_STACK] = [];
							this[PROPERTY_REDO_STACK] = [];
						}

						notifyCanPropertyChanges();
					}

					return undo;
				},
				ex=>Promise.reject(ex)
			);
		});
	}

	get canUndo() {
		return !!this[PROPERTY_UNDO_STACK].length;
	}

	get canReset() {
		return !!(this[PROPERTY_UNDO_STACK].length + this[PROPERTY_REDO_STACK].length);
	}

	get canRedo() {
		return !!this[PROPERTY_REDO_STACK].length;
	}
}
