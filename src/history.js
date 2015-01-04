import {Diary} from '../lib/diary/diary';
Diary.logger('history').info( "loaded");

import Base from './base';
import View from './view';
import Constants from './constants';
import App from './app';
import {spawn} from './util';

let PROPERTY_UNDO_STACK = Symbol('UNDO_STACK'),
		PROPERTY_REDO_STACK = Symbol('REDO_STACK'),
		PROPERTY_BUSY_PROMISE = Symbol('BUSY_PROMISE')
;

function _reset() {
	this[PROPERTY_UNDO_STACK] = [];

	this[PROPERTY_REDO_STACK] = [];
}

function _when(fn:Function) {
	let handler = ()=>{
		return new Promise((resolve, reject)=>{
			try {
				return Promise.resolve(fn.call(this)).then(resolve, reject);
			} catch(ex) {
				reject(ex);
			}
		});
	};

	return this[PROPERTY_BUSY_PROMISE] = this[PROPERTY_BUSY_PROMISE].then(handler, handler);
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

		this[PROPERTY_BUSY_PROMISE] = Promise.resolve("huhu");
		this.reset();

		Object.defineProperties(this, {
			'app' : {
				value    : app,
				writable : false
			},
			'limit' : {
				value    : limit,
				writable : false
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

			promise = promise.then(
				undo=>{
						// if history is enabled
					if(this.limit!==0) {
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
						}
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

			let undoFunction = undoStack[undoStack.length-1];

				// execute undo function and wrap result into a promise
			let undoResult = new Promise((resolve, reject)=>{
				try {
					return Promise.resolve(undoFunction.fn()).then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			});

			return undoResult.then(redo=>{
						// remove operation from undo stack
					undoStack.pop();

					if(typeof(redo)==='function') {
						redoStack.push(redo);

							// remove oldest redo operation if redo count > limit
						if(this.limit!==0 && redoStack.length>this.limit) {
							redoStack.shift();
						}
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

			let redoFunction = redoStack[redoStack.length-1];

				// execute undo function and wrap result into a promise
			let redoResult = new Promise((resolve, reject)=>{
				try {
					return Promise.resolve(redoFunction.fn()).then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			});

			return redoResult.then(
				undo=>{
						// remove operation from redo stack
					redoStack.pop();

					if(typeof(undo)==='function') {
						undoStack.push(undo);

							// remove oldest undo operation if undo count > limit
						if(this.limit!==0 && undoStack.length>this.limit) {
							undoStack.shift();
						}
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
