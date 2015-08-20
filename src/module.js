import Logger from './logger';
Logger('module').info('loaded');
import Base from './base';

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

      // we wrap the callback argument to ensure that the
      // promise property will reflect also the warning
      // when no template was assigned to the view were registered
    let cbWithAssertion = ()=>{
      return new Promise((resolve,reject)=>{
        try {
          return Promise.resolve(
            cb(this)
          ).then(val=>{
            this.assert(Object.keys(this.states).length, `A module must have at least a single state.`);
            return val;
          })
          .then(resolve, reject);
        } catch(ex) {
          reject(ex);
        }
      })
    };

    this.options[Base._PROMISIFY](cbWithAssertion);
  }

    // TODO : 2nd argument should be an arrow function with type annotations but traceur failed to compile it
  createState(name:string, createStateCb:Function) {
    this.assert(!this.app, `createState(...) : You cannot create states after module is in use by an app`);

    this
    .assert(()=>!this.states[name], `state (name='${name}') aleady registered`)
    .log(`register state '${name}'`);

    return this.states[name] = new State(this, name, createStateCb);
  }

    /**
    * @param targetViewOrCb can View or even a function returning the target view
    * (the callback type is used to implement undo/redo where the target operation is dynamic)
    *
    * TODO : this function 99% identical with state.js/createTransition but traceur/browserify made trouble
    * when i tried to move this code into util.js to be used by both classes
    */
  createTransition(name:string, createTransitionCb:Function, targetViewOrCb) {
    this.assert(!this.app, `createTransition(...) : You cannot create transitions after module is in use by an app`);

    this.assert(
      (targetViewOrCb instanceof View) || (typeof(targetViewOrCb)==='function'),
      '3rd argument expected to be View or function<View>'
    );

    this
    .assert(()=>!this.transitions[name], `transition (name='${name}') aleady registered`)
    .log(`register transition '${name}'`);

    let targetView = targetViewOrCb;

      // manual type assertion
    if (targetView instanceof View) {
        // ensure both states are owned by same module
      this.assert(()=>targetView.state.module===this, `target view(name='${targetView.name}') state(name='${targetView.state.name}') is owned by foreign module(name='${targetView.state.module.name}') of domain(name='${targetView.state.module.domain.name}')`)
    }

    return this.transitions[name] = new Transition(this, name, createTransitionCb, targetView);
  }
}

import Domain from './domain';
import State from './state';
import View from './view';
import Transition from './transition';
