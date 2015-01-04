// helper methods used by many ampere components

import {Diary} from '../lib/diary/diary';

let logger = Diary.logger('util')
logger.info( "loaded");

function assert(condition, msg) {
	if(typeof(condition)==='function') {
		msg = msg || `assert "condition.toString()" failed`;
		condition = condition();
	} else {
		msg = msg || 'assert(...) failed';
	}

	if( !condition) {
		(typeof(msg)=='function') && (msg = msg());

		throw new Error( `util : ${msg}`);
	}

	return this;
}

	/*
		@return the prefix string used for log messages and errors
	*/
function _getNamespace(obj:Base) {
	return `${obj.type}:${obj.options[Constants.NAMESPACE]}`;
};
/*
function spawn(generator) {
		// ensure argument is a generator function
	assert(generator && generator.constructor && 'GeneratorFunction' == generator.constructor.name, 'functor(generator) : argument expected to be a generator');

	let iter, resume = (function(promise:Promise) {
		return promise.then(
			(result)=>{
				iter.next(result);
				return result;
			},
			(ex)=>{
				iter.throw(ex);
				return Promise.reject( ex);
			}
		);
	});

	return iter=generator(resume);
};*/
function spawn(generatorFunc) {
	function continuer(verb, arg) {
		let result;
		try {
			result = generator[verb](arg);
		} catch (err) {
			return Promise.reject(err);
		}
		if (result.done) {
			return result.value;
		} else {
			return Promise.resolve(result.value).then(onFulfilled, onRejected);
		}
	}

	let generator = generatorFunc(),
			onFulfilled = continuer.bind(continuer, "next"),
			onRejected = continuer.bind(continuer, "throw")
	;

	return onFulfilled();
}

/*
let unPromisify = (function() {
	let run = (generator)=>{
		let iter, resume = (function(promise:Promise) {
			return promise.then(
				(result)=>{
					iter.next(result);
					return result;
				},
				(ex)=>{
					iter.throw(ex);
					return Promise.reject( ex);
				}
			);
		}).bind(this);

		return iter=generator(resume);
	};

	return function unPromisify(promise:Promise) {
		let iter = run(function*generator(resume) {
			console.log("before");
			var result = yield resume(promise);
			console.log("result = " + result);
		});

		debugger
		for(let result of iter) {
			return result;
		}
	}
})();
*/
export {
	_getNamespace,
	spawn
	/*,
	unPromisify*/
};

import Base from './base';
import Constants from './constants';
