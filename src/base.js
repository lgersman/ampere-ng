import {Diary} from '../lib/diary/diary';
Diary.logger('base').info( "loaded");

// TODO : this should be importable but traceur fails right now
// fortunately the chained sources helps us out and provide Ampere
// due to a bug :-)
// import Ampere from "./ampere";

/**
	base class for all ampere entities
*/

/**
	class Base is the common base class of Ampere.

	Every ampere entity (Domain, State, etc.) inherits from Base.

	Base is Promise-alike so it might be initialized lazily.
*/
export default class Base {
	constructor(name:string, type:string, parentOptions:Object=null) {
		let namespace = parentOptions && parentOptions[Constants.NAMESPACE];
		namespace = namespace ? `${namespace}.[${name!=Constants.DEFAULT ? JSON.stringify(name) : 'default'}]` : `[${name!=Constants.DEFAULT ? JSON.stringify(name) : 'default'}]`;

		Object.defineProperties(this, {
			'options' : {
				value    : Object.create(parentOptions),
				writable : false
			}
		});

		Object.defineProperties(this.options, {
			[Constants.NAME] : {
				value    : name,
				writable : false,
				enumerable: true
			},
			[Constants.TYPE] : {
				value    : type,
				writable : false,
				enumerable: true
			},
			[Constants.NAMESPACE] : {
				value    : namespace,
				writable : false,
				enumerable: true
			}
		});

			// log : function log.info with all attached diary methods returning this
		let logger = Diary.logger(_getNamespace(this)),
				log = Object.assign((msg)=>logger.info.call(logger, msg) || this, Object.getPrototypeOf(logger), logger)
		;

		Object.defineProperties(this.options, {
			[Constants.LOG] : {
				value					: log,
				writable			: false
			}
		});

			// make a deferred like object available via
			// Base.options[Base._PROMISIFY]
		let promise = new Promise((resolve,reject)=>{
			this.options[Base._PROMISIFY] = (cb, ...args)=>{
						// TODO : Function type as argument doesnt work with traceur yet
						// thats why we call assert manually
					assert.argumentTypes(cb, Function);

						// remove deferred on call
					delete this.options[Base._PROMISIFY];

					try {
						Promise.resolve(cb(this, ...args)).then(resolve, reject);
					} catch(ex) {
						reject(ex);
					}
			};
		});

		Object.defineProperties(this, {
			'promise' : {
				value    : promise,
				writable : false
			}
		});

		this.promise.then(
			arg=>{
				this.log(`resolved with ${JSON.stringify(arg)}`);
				return arg;
			},
			ex=>{
				this.log.error(ex ? ex.message || ex : `unknown error occured(arguments=${arguments})`);
				return Promise.reject( ex);
			}
		);
	}

	get name() {
		return this.options[Constants.NAME];
	}

	get log() {
		return this.options[Constants.LOG];
	}

		/**
			@param condition(Function|expression) condition to evaluate. if a fuinction is given the functiongets called and its result is the condition
			@param msg(String|Function) (optional) the assertion message to throw if condition evaulates to false. if argument is not given the msg will be compiled out ot the condition argument
			@return this
		*/
	assert(condition, msg) {
		if(typeof(condition)==='function') {
			msg = msg || `assert "condition.toString()" failed`;
			condition = condition();
		} else {
			msg = msg || 'assert(...) failed';
		}

		if(!condition) {
			(typeof(msg)=='function') && (msg = msg());

			throw new Error( `[${this.type}:${this.options[Constants.NAMESPACE]}] : ${msg}`);
		}

		return this;
	}

	get type() {
		return this.options[Constants.TYPE];
	}

	toString() {
		return this.options[Constants.NAMESPACE];
	}
}

	// protected option key to retrieve wrapper function finalizing the derived object
Base._PROMISIFY = Symbol('promisify');

import {_getNamespace} from "./util";
import Constants from "./constants";
