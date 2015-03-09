import {Diary} from '../lib/diary/diary';
Diary.logger('domain').info( "loaded");
import Constants from "./constants";
import Base from "./base";

  // TODO : 2nd argument should be an arrow function with type annotations but traceur failed to compile it
function createModule(name, createModule) {
    // manual type assertion
  assert.argumentTypes(name, $traceurRuntime.type.string, createModule, Function);

  if(typeof(name)!=='string') {
    this.log(`createModule() : name argument(='${name}') is not a string -> reset name to Constants.DEFAULT`);
    name = Constants.DEFAULT;
  }

  this
  .assert(()=>!this.modules[name], `module (name='${name}') aleady registered`)
  .log(`register module '${name}'`);

  this.modules[name] = new Module(this, name, createModule);

  return this.modules[name];
}

/**
  Domain represents an encapsulated world of Ampere modules.

  The Domain class allows parallel ampere worlds with same named modules.

  Domains are completely disconnected from others.
*/
export default class Domain extends Base {
  constructor(name:string, cb:Function) {
    super(name, 'domain', Domain.Ampere.options);

    Object.defineProperties(this, {
      'Ampere' : {
          // TODO : this is a hack !!
          // see details in domain.js
        value    : Domain.Ampere,
        writable : false
      },
      'modules' : {
        value    : {},
        writable : false
      }
    });

    this.options[Base._PROMISIFY](cb, createModule.bind(this));
  }
}

import {_getNamespace} from "./util";
import Module from "./module";
