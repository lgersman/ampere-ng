import Logger from './logger';
Logger('view').info('loaded');

import Constants from './constants';
import Base from './base';

/**
  View is a dedicated screen of a State. A State has always >= 1 views.

  Multiple views can be used to have different user interfaces for the same state
  (think about desktop versus print or mobile screen of a website).
*/
export default class View extends Base {
  constructor(state:State, name:string, cb:Function) {
    super(name, 'view', state.options);

    Object.defineProperties(this, {
      'state' : {
        value    : state,
        writable : false
      },
      'transitions' : {
        value    : {},
        writable : false
      },
    });

      // we wrap the callback argument to ensure that the
      // promise property will reflect also the warning
      // when no template was assigned to the view were registered
    let cbWithAssertion = ()=>{
      return new Promise((resolve,reject)=>{
        try {
          return Promise.resolve(cb(this)).then(val=>{
            !('template' in this) && this.log.warn('no template was assigned.');
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

  createTransition(name:string, createTransitionCb:Function, targetView) {
    this.assert(!this.state.app, `createTransition(...) : You cannot create transitions after view states module is in use by an app`);

    if (typeof(name)!=='string') {
      this.log( `createTransition() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
      name = Constants.DEFAULT;
    }

    this
    .assert(()=>!this.transitions[name], `transition (name='${name}') aleady registered`)
    .log(`register transition '${name}'`);

      // try evaluate target view if not provided
    if (arguments.length===2) {
      this.log( 'createTransition() : target view argument not given - assume this as target view');
      targetView = this;
    }

      // manual type assertion
    assert.argumentTypes(name, $traceurRuntime.type.string, createTransitionCb, Function, targetView, View);

      // ensure both states are owned by same module
    this.assert(
      ()=>targetView.state.module===this.state.module,
      `target view(name='${targetView.name}') of state(name='${targetView.state.name}') is owned by foreign module(name='${targetView.state.module.name}') of domain(name='${targetView.state.module.domain.name}')`
    );

    return this.transitions[name] = new Transition(this, name, createTransitionCb, targetView);
  }

  createTemplate(value) {
    this
    .assert(!this.state.app, `createTemplate(...) : You cannot create templates after view states module is in use by an app`)
    .assert(!!value, 'createTemplate(value) : argument value expected to be truthy but was $(value)')
    .assert(!('template' in this), 'createTemplate(value) : template property is already assigned')
    ;

    Object.defineProperties(this,{
      'template'  : {
        value      : value,
        writable  : false
      }
    });
  }
}

import Transition from './transition';
import State from './state';
