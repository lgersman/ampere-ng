import {Diary} from '../lib/diary/diary';
Diary.logger('module').info( "loaded");
import Constants from "./constants";
import Base from "./base";

  // TODO : 2nd argument should be an arrow function with type annotations but traceur failed to compile it
function createState(name, createState) {
    // manual type assertion
  assert.argumentTypes(name, $traceurRuntime.type.string, createState, Function);

  if(typeof(name)!=='string') {
    this.log(`createState() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
    name = Constants.DEFAULT;
  }

  this
  .assert(()=>!this.states[name], `state (name='${name}') aleady registered`)
  .log(`register state '${name}'`);

  return this.states[name] = new State(this, name, createState);
}

  /**
  * @param targetViewOrStateCb can be one of State,View or even a function returning the current target view
  * (the callback type is used to implement undo/redo where the target operation is dynamic)
  *
  * TODO : this function 99% identical with state.js/createTransition but traceur/browserify made trouble
  * when i tried to move this code into util.js to be used by both classes
  */
function createTransition(name:string, createTransitionCb:Function, targetViewOrStateCb) {
  this.assert(
    (targetViewOrStateCb instanceof State) || (targetViewOrStateCb instanceof View) || (typeof(targetViewOrStateCb)==='function'),
    '3rd argument expected to be a State, View or function<View>'
  );

  if(typeof(name)!=='string') {
    this.log( `createTransition() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
    name = Constants.DEFAULT;
  }

  this
  .assert(()=>!this.transitions[name], `transition (name='${name}') aleady registered`)
  .log(`register transition '${name}'`);

  let targetView = targetViewOrStateCb;

    // try evaluate target view if not provided
  if(typeof(targetView)==='function') {
    // do nothing if targetView is a function
  } else if(!(targetView instanceof View)) {
    this.log( 'createTransition() : target view argument not a view - trying to resolve it automagically');
    let targetState;

      // no targetViewOrStateCb argument was given
    if(arguments.length<3) {
        // if targetViewOrStateCb argument was not provided we assume this state is the target state
      targetState = this;
      this.log( `createTransition() : target view argument was not given - assuming target state===this(name='${targetState.name}')`);
    } else if(targetViewOrStateCb instanceof State) {
      targetState = targetViewOrStateCb;
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
          throw new Error( `${_getNamespace(this)}->createTransition() : could not evaluate target view from target state(name='${targetState.name}') : no default view(name='${Constants.DEFAULT}') found in target state.views(=${JSON.stringify(Array.from(targetState.views.keys()))})`);
        }
      }
    }
  }

    // manual type assertion
  if(targetView instanceof View) {
    assert.argumentTypes(name, $traceurRuntime.type.string, createTransitionCb, Function, targetView, View);

      // ensure both states are owned by same module
    this.assert(()=>targetView.state.module===this, `target view(name='${targetView.name}') state(name='${targetView.state.name}') is owned by foreign module(name='${targetView.state.module.name}') of domain(name='${targetView.state.module.domain.name}')`)
  } else {
    assert.argumentTypes(name, $traceurRuntime.type.string, createTransitionCb, Function, targetView, Function);
  }

  return this.transitions[name] = new Transition(this, name, createTransitionCb, targetView);
}

/**
  Module contains a set of states connected by transitions.

  Modules are an abstraction of an application or even partial application
  (like an Android activity). Modules may interact with other modules.

  Modules from same Domain can interact and may share code and data.
*/
export default class Module extends Base {
  constructor(domain:Domain, name:string, cb:Function) {
    super(name, 'module', domain.options);

    Object.defineProperties(this, {
      'domain' : {
        value    : domain,
        writable : false
      },
      'states' : {
        value    : {},
        writable : false
      },
      'transitions' : {
        value    : {},
        writable : false
      }
    });

    this.options[Base._PROMISIFY](cb, createState.bind(this), createTransition.bind(this));
  }
}

import Domain from "./domain";
import State from "./state";
import {_getNamespace} from "./util";
import View from "./view";
import Transition from "./transition";
