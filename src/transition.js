import {Diary} from '../lib/diary/diary';
Diary.logger('transition').info( "loaded");

import Base from "./base";
import Constants from "./constants";

const defaultTransaction = (transition,...args)=>{
    let undo, redo=()=>undo;

    return (undo=()=>redo);
  },
  defaultDisabled = transition=>false
;

function value2Function(value) {
  return transition=>value;
}

/**
  Transition is a directed connection to move the current application view to another View.
*/
export default class Transition extends Base {
    /**
      * @param view view or function returning view
      * @param viewOrCb target view or function returning the target view
    */
  constructor(view, name:string, cb:Function, targetViewOrCb) {
      // manual type assertion
    if(view instanceof View) {
      assert.argumentTypes(view, View, name, $traceurRuntime.type.string, cb, Function, targetViewOrCb, View);
    } else {
      assert.argumentTypes(view, Module, name, $traceurRuntime.type.string, cb, Function, targetViewOrCb, targetViewOrCb instanceof View ? View : Function);
    }

    super(name, 'transition', view.options);

    if(view instanceof View) {
      Object.defineProperties(this, {
        'view' : {
          value    : view,
          writable : false
        },
      });
    } else if(view instanceof Module) {
      let module = view;
      Object.defineProperties(this, {
        'module' : {
          value      : module,
          writable   : false
        },
        'view' : {
          get        : ()=>(module.app || {}).view,
          configurable : false
        }
      });
    } else {
      this.assert( false, '1st argument expected to be a View or Module');
    }

    let _disabled, _transaction;
    Object.defineProperties(this, {
      'target' : {
        get      : (targetViewOrCb instanceof View) ? value2Function(targetViewOrCb) : targetViewOrCb,
        configurable : false
      },
      'disabled' : {
        set      : disabled=>{
            // optimiziation : if disabled is a function
          if(typeof(disabled)==='function') {
              // wrap it in a function doing the reuest everytime new
            _disabled = ()=>{
              return new Promise((resolve, reject)=>{
                try {
                  Promise.resolve(disabled(this)).then(resolve, reject);
                } catch(ex) {
                  reject(ex);
                }
              });
            };
          } else {
              // return always the same Promise for it
            let promise = new Promise((resolve, reject)=>{
              try {
                Promise.resolve(disabled).then(resolve, reject);
              } catch(ex) {
                reject(ex);
              }
            });
            _disabled = ()=>promise;
          }
        },
        get      : ()=>_disabled(),
        configurable : false
      },
      'transaction' : {
        set       : transaction=>{
            // TODO : Function type as argument doesnt work with traceur yet
            // thats why we call assert manually
          assert.argumentTypes(transaction, Function);

          _transaction = (...args)=>{
            return new Promise((resolve, reject)=>{
              try {
                return Promise.resolve(transaction(this, ...args)).then(resolve, reject);
              } catch(ex) {
                reject(ex);
              }
            });
          };
        },
        get      : ()=>_transaction,
        configurable : true
      }
    });

    this.disabled = defaultDisabled;
    this.transaction = defaultTransaction;

    this.options[Base._PROMISIFY](cb);
  }
}

import View from "./view";
import Module from "./module";
