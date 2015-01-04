import {Diary} from '../lib/diary/diary';
Diary.logger('state').info( "loaded");

import Constants from "./constants";
import Base from "./base";

function createView(name:string, createViewCb:Function) {
	if(typeof(name)!=='string') {
		this.log( `createState() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
		name = Constants.DEFAULT;
	}

	this
	.assert(()=>!this.views[name], `view (name='${name}') aleady registered`)
	.log(`register view '${name}'`);

	return this.views[name] = new View(this, name, createViewCb);
};

	/**
	* TODO : this function 99% identical module state.js/createTransition but traceur/browserify made trouble
	* when i tried to move this code into util.js to be used by both classes
	*/
function createTransition(name:string, createTransitionCb:Function, targetViewOrState) {
	if(typeof(name)!=='string') {
		this.log( `createTransition() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
		name = Constants.DEFAULT;
	}

	this
	.assert(()=>!this.transitions[name], `transition (name='${name}') aleady registered`)
	.log(`register transition '${name}'`);

	let targetView = targetViewOrState;

		// try evaluate target view if not provided
	if(!(targetView instanceof View)) {
		this.log( 'createTransition() : target view argument not a view - trying to resolve it automagically');
		let targetState;

			// no targetViewOrState argument was given
		if(arguments.length<3) {
				// if targetViewOrState argument was not provided we assume this state is the target state
			targetState = this;
			this.log( `createTransition() : target view argument was not given - assuming target state===this(name='${targetState.name}')`);
		} else if(targetViewOrState instanceof State) {
			targetState = targetViewOrState;
			this.log( `createTransition() : target view argument was a state(name='${targetState.name}')`);
		}

			// if no view was provided we will fallback to this state's default view(name=Constants.DEFAULT) or first view
		if(targetState instanceof State) {
			this.log( `createTransition() : try to resolve target view from state(name='${targetState.name}')`);
			if(Object.keys(targetState.views).length==1) {
				targetView = targetState.views[Object.keys(targetState.views)[0]];
				this.log( `createTransition() : target state(name='${targetState.name}') has just one view(name='${targetView.name}') - assuming it as target view`);
			} else {
				targetView = targetState.views[Constants.DEFAULT];
				if( targetView) {
					this.log( `createTransition() : target state(name='${targetState.name}') had multiple views - take view(name='${targetView.name}') as target view`);
				} else {
						// this may actually not happen because State constructor will throw an execption in case of a no state views
					throw new Error(`${_getNamespace(this)}->createTransition() : could not evaluate target view from target state(name='${targetState.name}') : no default view(name='${Constants.DEFAULT}') found in target state.views(=${JSON.stringify(Array.from(targetState.views.keys()))})`);
				}
			}
		}
	}

		// manual type assertion
	assert.argumentTypes(name, $traceurRuntime.type.string, createTransitionCb, Function, targetView, View);

		// ensure both states are owned by same module
	this.assert(
		()=>targetView.state.module===this.module,
		`target view(name='${targetView.name}') state(name='${targetView.state.name}') is owned by foreign module(name='${targetView.state.module.name}') of domain(name='${targetView.state.module.domain.name}')`
	);

	return this.transitions[name] = new Transition(this, name, createTransitionCb, targetView);
}

/**
	State represents a conrete state of an application.
	A state in conjunction with a View can be seen as a concrete
	"screen" of an application.

	States can be connected to other states by transitions.
*/
export default class State extends Base {
	constructor(module:Module, name:string, cb:Function) {
		super(name || Constants.DEFAULT, 'state', module.options);

		Object.defineProperties(this, {
			'module' : {
				value    : module,
				writable : false
			},
			'views' : {
				value    : {},
				writable : false
			},
			'transitions' : {
				value    : {},
				writable : false
			}
		});

			// we wrap the callback argement to ensure that the
			// promise property will reflect also the assertion failure
			// when no views were registered
		let cbWithAssertion = ()=>{
			return new Promise((resolve,reject)=>{
				try {
					return Promise.resolve(
						cb(this, createView.bind(this), createTransition.bind(this))
					).then(retval=>{
						this.assert(Object.keys(this.views).length, `A state must have at least a single view.`);
						return retval;
					})
					.then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			})
		};

		this.options[Base._PROMISIFY](cbWithAssertion);
	}
}

import Module from "./module";
import View from "./view";
import Transition from "./transition";
import {_getNamespace} from "./util";
