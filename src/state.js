import {Diary} from '../lib/diary/diary';
Diary.logger('state').info( "loaded");

import Constants from "./constants";
import Base from "./base";

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
      }
    });

      // we wrap the callback argement to ensure that the
      // promise property will reflect also the assertion failure
      // when no views were registered
    let cbWithAssertion = ()=>{
      return new Promise((resolve,reject)=>{
        try {
          return Promise.resolve(
            cb(this)
          ).then(val=>{
            this.assert(Object.keys(this.views).length, `A state must have at least a single view.`);
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

  createView(name:string, createViewCb:Function) {
    this.assert(!this.module.app, `createView(...) : You cannot create views after state module is in use by an app`);

    if(typeof(name)!=='string') {
      this.log( `createState() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
      name = Constants.DEFAULT;
    }

    this
    .assert(()=>!this.views[name], `view (name='${name}') aleady registered`)
    .log(`register view '${name}'`);

    return this.views[name] = new View(this, name, createViewCb);
  }
}

import Module from "./module";
import View from "./view";
import {_getNamespace} from "./util";
