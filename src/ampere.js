/**
  This file acts as bootstrap file into ampere world.

  It exposes the Ampere Domain creator function and ampere related constants
*/

import Logger from './logger';
import Constants from './constants';

  // configure Ampere logging
if (global.Ampere && global.Ampere.DEBUG) {
  Logger.filter = /^.*/;
}

Logger('ampere').info( 'loaded');

  /**
  * creates a new domain
  *
  */
function createDomain(name:string=Constants.DEFAULT, cb:Function) {
    /*
      TODO : domain should be cacheable or queryable in some kind.
       ... how about assigning a symbol to each domain to make them
       cachable also when having same name (which may happen in a decoupled world) ?
    */
  return new Domain(name || Constants.DEFAULT, cb);
}

/**
* creates a new app
*
*/
import App from './app';
import View from './view';
function createApp(view:View, cb:Function=()=>{}) {
  return new App(view, cb);
}

import Base from './base';
var Ampere = Object.create(new Base('Ampere', 'ampere'), {
  'domain' : {
    value    : createDomain,
    writable : false
  },
  'app' : {
    value    : createApp,
    writable : false
  }/*,
  'util' : {
    value    : {
      unPromisify : util.unPromisify
    },
    writable : false
  }*/
});

import Domain from './domain';
  // TODO : this is a hack !!
  // because traceur cannot handle circular references (Ampere needs Domain and Domain needs Ampere)
  // we provide Ampere to Domain by attaching it as constant to the Domain class
Object.defineProperty(Domain, 'Ampere', {
  value    : Ampere,
  writable : false,
  enumerable : true
});

for (let name of Object.getOwnPropertyNames(Constants)) {
  Object.defineProperty(Ampere, name, {
    value    : Constants[name],
    writable : false,
    enumerable : true
  });
}

export default Ampere;
