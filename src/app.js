import Logger from './logger';
Logger('app').info('loaded');

import Base from './base';
import View from './view';
import Constants from './constants';
import Transition from './transition';

  /**
  * injects setView call into undo/redo function
  */
function wrapOperation(operation:Function, view:View, setView:Function) {
  let wrapper = function() {
    let reverseView = view.state.module.app.view;

    if (typeof(operation)==='function') {
      let promise = new Promise((resolve, reject)=>{
        try {
          return Promise.resolve(operation()).then(resolve, reject);
        } catch(ex) {
          reject(ex);
        }
      });

      promise = promise.then(
          // wait for transition view to be ready
        reverseOperation=>view.promise.then(()=>{
          setView(view);
          if (typeof(reverseOperation)==='function') {
            return wrapOperation(reverseOperation, reverseView, setView);
          } else {
            return reverseOperation;
          }
        }),
        ex=>Promise.reject(ex)
      );

      return promise;
    } else {
      return Promise.resolve(operation);
    }
  };

  return wrapper;
}

  /**
  *  default executor implementation

  * @param transition the transition to execute
  * @param setView contextual function to set the resulting view
  */
function defaultExecutor(transition:Transition,setView:Function,...params) {
  let transaction = transition.transaction;

    // execute transition transaction
  let promise = new Promise((resolve, reject)=>{
    try {
      return Promise.resolve(transaction(...params)).then(resolve, reject);
    } catch(ex) {
      reject(ex);
    }
  });

    // execute redo operation
  promise = promise.then(
    redo=>{
      return wrapOperation(redo, transition.target, setView)();
    }
  );

  return promise;
}

export default class App extends Base {
  constructor(view:View, cb:Function=(app)=>{}) {
      // ensure module is not yet associated with an app
    if (!Object.hasOwnProperty(view.state.module, 'app')) {
      throw new Error(`module is already associated with app(=${view.state.module.ui.name})`);
    }

    var options = Object.create(view.state.module.options);

      // a little hackish : derive namespace from module namespace
      // CURIOUS : for some reason the following will not work since Base declares NAMESPACE via defineProperty :
      // options[Constants.NAMESPACE] = view.state.module.options[Constants.NAMESPACE];
    Object.defineProperty( options, Constants.NAMESPACE, {
      value : view.state.module.options[Constants.NAMESPACE]
    });

    super(view.state.module.name, 'app', options);

    let  _view = view,
        _executor,
        _uiInterface,
        setView = (function(notifier) {
          return function setView(view:View) {
            if (notifier) {
              let oldView = _view;

              // not needed here
              //notifier.performChange('view', ()=>_view=view, this);

              _view = view;

              notifier.notify({
                type: 'update',
                name: 'view',
                oldValue: oldView
              });
            } else {
              _view=view;
            }
          }.bind(this);
        }).call(this, Object.getNotifier && Object.getNotifier(this));
    ;
    Object.defineProperties(this, {
      'view'     : {
        get      : ()=>_view,
        configurable : false
      },
        /* property execute : a function responsible to perform a transition */
      'execute'  : {
        get  : ()=>_executor,
        set : function(executor:Function) {
            // wrap executor function by a wrapper providing app,transition and function setView(view)
          _executor=function(transition:Transition, ...params) {
              // assert transition to execute is part of current state's transitions
            this.assert(
              [for(key of Object.keys(this.view.transitions)) this.view.transitions[key]].indexOf(transition)!==-1
              || ([for(key of Object.keys(this.view.state.module.transitions)) this.view.state.module.transitions[key]].indexOf(transition)!==-1),
              ()=>`execute() : transition(=${transition && transition.name ? transition.name : transition}) is not part of current state(=${this.view.state.name}) or module(=${this.view.state.module.name})`
            );

              // execute transition when its NOT disabled
            return transition.disabled.then(
              value=>(value && Promise.reject(new Error(`execute() transition(=${transition.name || '[default]'}) is disabled(=${value})`))) || this.history.execute(()=>executor(transition, setView, ...params)),
              ex=>Promise.reject(new Error(`Error occured while getting transition(=${transition.name || '[default]'}).disabled : ${ex.message}`))
            );
          }.bind(this);
        },
        configurable : false
      },
      'ui' : {
        get  : ()=>_uiInterface,
        set : function(uiInterface:Function) {
          _uiInterface=uiInterface.bind(this, this);
        },
        configurable : false
      }
    });

      // install defaultExecutor
    this.execute = defaultExecutor;

      // default ui interface does nothing
    this._uiInterface = function(app:App) { };

      // link this app to into the module
    Object.defineProperties(this.view.state.module, {
      'app'    : {
        value    : this,
        writable : false
      }
    });

    let _cb = app=>{
      let val = cb(app);

      Object.defineProperties(this, {
        'history'    : {
          value    : new History(this),
          writable : false
        }
      });

      return val;
    };

    let onReady = ()=>Promise.all([
        // app.promise is fullfilled when promise of callback, module, all states, views and transitions
        // are resolved
      new Promise((resolve,reject)=>{
        try {
          Promise.resolve(_cb(this)).then(resolve, reject);
        } catch(ex) {
          reject(ex);
        }
      }),
      view.state.module.domain.promise,
      view.state.module.promise,
      ...Object.keys(view.state.module.transitions).map(name=>view.state.module.transitions[name].promise),
        // collect promises of states, their views and the transitions of the views
      ...Object.keys(view.state.module.states).reduce((array, stateName)=>{
        const state = view.state.module.states[stateName];
        array.push(
          state.promise,
          ...Object.keys(state.views).reduce((array, viewName)=>{
            const view = state.views[viewName];
            array.push(
              view.promise,
              ...Object.keys(view.transitions).map(transitionName=>view.transitions[transitionName].promise)
            );
            return array;
          }, [])
        );
        return array;
      }, []),
      view.promise
    ]).then((...args)=>{
      this.log(`app is ready(arguments=${JSON.stringify(args)})`);
      return args[0][0];
    }, err=>{
      //this.log.error( "failed to initialize app : " + err);
      return Promise.reject( err);
    });

    this.options[Base._PROMISIFY](onReady);

    `
      /*
        now it gets a bit complicated ... the returned object is something special :

        (new App(...)) instanceof App
        (new App(...)) instanceof Base
        typeof(new App(...))==='function'
        we can call any method/property of App & Base : (new App(...)).log("huhu") / (new App(...)).promise.then(...)
        and finally we can call it itself : (new App(...))( ...)
      */

      // (1) we create a arrow function
    let functor = (generator)=>{
        // ensure argument is a generator function
      this.assert(generator && generator.constructor && 'GeneratorFunction' == generator.constructor.name, 'functor(generator) : argument expected to be a generator');

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
      // (2) set its prototype to this App instance
    typeof(Object.setPrototypeOf)==='function' ? Object.setPrototypeOf(functor, this) : (functor.__proto__=this);
      // (3) and return it instead of the App instance
    return functor;
    `
  }
}

import History from './history';
