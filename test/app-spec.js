import Ampere from "../src/ampere";
import App from "../src/app";
import Transition from "../src/transition";
import Base from "../src/base";
import util from "./util";
import {spawn} from "../src/util";
import Constants from "../src/constants";

describe("App", function () {
  describe( "property promise", ()=>{
    describe("resolves automatically when", ()=>{
      it( "no constructor callback is given", done=>{
        let domain = Ampere.domain(null, (domain, createModule)=>
          createModule(null, (module, createState)=>
            createState(null, (state, createView, createTransition)=>
              createView(null, view=>util.createMockTemplate(view, ''))
            )
          )
        );

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);
        app.promise.then( done);
      });

      it( "constructor callback returns not-a-promise", done=>{
        let domain = Ampere.domain(null, (domain, createModule)=>
          createModule(null, (module, createState)=>
            createState(null, (state, createView, createTransition)=>
              createView(null, view=>util.createMockTemplate(view, ''))
            )
          )
        );

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT], (app)=>"foo");
        app.promise.then(cb_retval=>{
          expect( cb_retval).toBe( "foo");
          done();
        });
      });

      it( "constructor callback returns a resolved promise", done=>{
        let domain = Ampere.domain(null, (domain, createModule)=>
          createModule(null, (module, createState)=>
            createState(null, (state, createView, createTransition)=>
              createView(null, view=>util.createMockTemplate(view, ''))
            )
          )
        );

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT], (app)=>Promise.resolve("foo"));
        app.promise.then(cb_retval=>{
          expect( cb_retval).toBe( "foo");
          done();
        });
      });

      it( "any other than the constructor-argument view rejects",(done)=>{
        let domain = Ampere.domain(null, (domain, createModule)=>{
          createModule(null, (module, createState)=>{
            createState(null, (state, createView, createTransition)=>{
              createView(null, view=>{
                util.createMockTemplate(view, '');
              });

              createView('invalid', view=>{
                util.createMockTemplate(view, '');
                throw new Error( "foo");
              });
            });
          })
        });

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);
        app.promise.then(done)
      });
    });

    describe("rejects automatically when", ()=>{
      it( "domain.promise rejects",(done)=>{
        let domain = Ampere.domain(null, (domain, createModule)=>{
          createModule(null, (module, createState)=>{
            createState(null, (state, createView, createTransition)=>
              createView(null, view=>util.createMockTemplate(view, ''))
            );
          })
          throw new Error( "foo");
        });

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);
        app.promise.catch( ex=>{
          done();
        })
      });

      it( "module.promise rejects",(done)=>{
        let domain = Ampere.domain(null, (domain, createModule)=>{
          createModule(null, (module, createState)=>{
            createState(null, (state, createView, createTransition)=>
              createView(null, view=>util.createMockTemplate(view, ''))
            );

            throw new Error( "foo");
          })
        });

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);
        app.promise.catch( ex=>{
          expect( ex.message).toBe( "foo");
          done();
        })
      });

      it( "one of the module states rejects or the view argument rejects",(done)=>{
        let domain = Ampere.domain(null, (domain, createModule)=>{
          createModule(null, (module, createState)=>{
            createState(null, (state, createView, createTransition)=>{
              createView(null, view=>util.createMockTemplate(view, ''));
            });

            createState('rejected', (state, createView, createTransition)=>{
              createView(null, view=>util.createMockTemplate(view, ''));
              throw new Error( "foo");
            });
          })
        });

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);
        app.promise.catch( ex=>{
          expect(ex.message).toBe( "foo");
          done();
        })
      });

      it( "view constructor-argument rejects",(done)=>{
        let domain = Ampere.domain(null, (domain, createModule)=>{
          createModule(null, (module, createState)=>{
            createState(null, (state, createView, createTransition)=>{
              createView(null, view=>{
                util.createMockTemplate(view, '');
                throw new Error("foo");
              });

              createView('valid', view=>{
                util.createMockTemplate(view, '');
              });
            });
          })
        });

        let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);
        app.promise.catch(ex=>{
          expect( ex.message).toBe( "foo");
          done();
        })
      });
    });
  });

  describe("execute(transition)", ()=>{
    function createMockApp(transitionCb:Function=()=>{}) {
      let view;
      Ampere.domain(null, (domain, createModule)=>{
        createModule(null, (module, createState)=>{
          createState(null, (state, createView, createTransition)=>{
            view = createView(null, view=>{
              util.createMockTemplate(view, '');
            });

            let target = createView('target', view=>{
              util.createMockTemplate(view, '');
            });

            createTransition(null,transitionCb,target);
          });
        })
      });

      return Ampere.app(view);
    }

    it("accepts only a transition from view.state.transitions as argument", done=>{
      let app = createMockApp(),
          otherStatesTransition
      ;
      Ampere.domain(null, (domain, createModule)=>{
        createModule(null, (module, createState)=>{
          createState(null, (state, createView, createTransition)=>{
            view = createView(null, view=>{
              util.createMockTemplate(view, '');
            });
            otherStatesTransition = createTransition(null,transitionCb,target);
          });
        })
      });

        // transition of current state should be accepted
      expect(()=>app.execute(app.view.state.transitions[Constants.DEFAULT])).not.toThrow();
        // transition of other state should be rejected
      expect(()=>app.execute(otherStatesTransition)).toThrow();

      done();
    });

    it("aborts when transition is disabled", done=>{
      const DISABLED_MESSAGE = "my condition is not fulfilled";
      let transition,
          app = createMockApp(t=>{
            transition = t;
          })
      ;

      spawn(function*() {
          // disabled by value
        try {
          transition.disabled = DISABLED_MESSAGE;

          yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
          debugger
          throw new Error("should never execute");
        } catch(ex) {
          expect(ex.message.includes(DISABLED_MESSAGE)).toBe(true);
        }

          // disabled by rejected promise
        try {
          transition.disabled = Promise.reject(new Error(DISABLED_MESSAGE));
          yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
          throw new Error("should never execute");
        } catch(ex) {
          expect(ex.message.includes(DISABLED_MESSAGE)).toBe(true);
        }

          // disabled by rejected promise with delay
        try {
          transition.disabled = new Promise((resume,reject)=>{
            setTimeout(()=>reject(new Error(DISABLED_MESSAGE)),500)
          });

          yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
          throw new Error("should never execute");
        } catch(ex) {
          expect(ex.message.includes(DISABLED_MESSAGE)).toBe(true);
        }

        done();
      });
    });

    it("delegates additonal parameters to execute", done=>{
      let transition,
          app = createMockApp(t=>{
            transition = t;
          }),
          received_params
      ;

      app.execute = (transition,setView,...params)=>received_params=params;

      spawn(function*() {
        yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
        expect(received_params).toEqual([]);

        const EXPECTED = ['foo', 'bar'];
        yield app.execute(app.view.state.transitions[Constants.DEFAULT], EXPECTED[0], EXPECTED[1]);
        expect(received_params).toEqual(EXPECTED);

        done();
      });
    });

    describe("default execute", ()=>{
      it("runs transition transaction and return a promise encapsulating the result", done=>{
        let transition,
            received_params,
            app = createMockApp(t=>{
              transition=t;
            })
        ;

        spawn(function*() {
          transition.transaction = (transition,...params)=>{
            let RESULT = ()=>received_params=params;

            return RESULT;
          };

          yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
          expect(received_params).toEqual([]);

          const EXPECTED = ['foo', 'bar'];
          yield app.execute(app.view.state.transitions[Constants.DEFAULT], EXPECTED[0], EXPECTED[1]);
          expect(received_params).toEqual(EXPECTED);

          done();
        });
      });

      it("runs transition.transaction and aborts in case of exception", done=>{
        let transition,
            received_params,
            app = createMockApp(t=>{
              transition=t;
            })
        ;

        spawn(function*() {
          transition.transaction = (transition,...params)=>{
            throw new Error("Failed to initialize transaction");
          };

          try {
            yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
            throw new Error("should never execute");
          } catch(ex) {
            expect(ex.message.includes("Failed to initialize transaction")).toBe(true);
          }

          done();
        });
      });

      it("runs transition.transaction and aborts in case of returned promise was rejected", done=>{
        let transition,
            received_params,
            app = createMockApp(t=>{
              transition=t;
            })
        ;

        spawn(function*() {
          transition.transaction = (transition,...params)=>Promise.reject(new Error("Failed to initialize transaction"));

          try {
            yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
            throw new Error("should never execute");
          } catch(ex) {
            expect(ex.message.includes("Failed to initialize transaction")).toBe(true);
          }

          done();
        });
      });

      it("runs transition.transaction function result and aborts in case function throws exception", done=>{
        let transition,
            received_params,
            app = createMockApp(t=>{
              transition=t;
            })
        ;

        spawn(function*() {
          transition.transaction = (transition,...params)=>{
            return ()=>{
              throw new Error("Failed to initialize transaction");
            };
          }

          try {
            yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
            throw new Error("should never execute");
          } catch(ex) {
            expect(ex.message.includes("Failed to initialize transaction")).toBe(true);
          }

          done();
        });
      });

      it("runs transition.transaction function result and aborts in case of returned promise was rejected", done=>{
        let transition,
            received_params,
            app = createMockApp(t=>{
              transition=t;
            })
        ;

        spawn(function*() {
          transition.transaction = (transition,...params)=>{
            return ()=>Promise.reject(new Error("Failed to initialize transaction"));
          }

          try {
            yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
            throw new Error("should never execute");
          } catch(ex) {
            expect(ex.message.includes("Failed to initialize transaction")).toBe(true);
          }

          done();
        });
      });
    });

    describe("overriding execute", ()=>{
      let app = createMockApp(t=>{
            transition = t;
          })
      ;

      it("returns the value returned by the executor", done=>{
        app.execute = (transition,setView,...params)=>"result";

        spawn(function*() {
          let result = yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
          expect(result).toBe("result");

          done();
        });
      });

      it("aborts if the executor throws an exception", done=>{
        app.execute = (transition,setView,...params)=>{
          throw new Error("wow - problem occurred");
        };

        spawn(function*() {
          try {
            yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
            throw new Error("should never happen");
          } catch(ex) {
            expect(ex.message.includes("wow - problem occurred")).toBe(true);
          }

          done();
        });
      });

      it("aborts if the executor returns a rejected promise", done=>{
        app.execute = (transition,setView,...params)=>Promise.reject(new Error("wow - problem occurred"));

        spawn(function*() {
          try {
            yield app.execute(app.view.state.transitions[Constants.DEFAULT]);
            throw new Error("should never happen");
          } catch(ex) {
            expect(ex.message.includes("wow - problem occurred")).toBe(true);
          }

          done();
        });
      });
    });
  });

  describe("history", ()=>{
    let createMockModuleView = function(options={}) {
      let view;
      Ampere.domain(null, (domain, createModule)=>{
        createModule(null, (module, createState)=>{
          const symbols = Object.getOwnPropertySymbols(options);
          for(let key in symbols) {
            let symbol = symbols[key];
            module.options[symbol]=options[symbol];
          }

          createState(null, (state, createView, createTransition)=>{
            view = createView(null, view=>{
              util.createMockTemplate(view, '');
            });

            createView('target', view=>{
              util.createMockTemplate(view, '');
            });

            createTransition(null,(transition)=>{},view);
          });
        })
      });

      return view;
    }

    describe("limit",()=>{
      it("default HISTORY.LIMIT", done=>{
        let app = Ampere.app(createMockModuleView());
        app.promise.then(()=>{
          expect(app.history.limit).toBe(Number.POSITIVE_INFINITY);
          done();
        });
      });

      it("custom HISTORY.LIMIT from app.options", done=>{
        let app = Ampere.app(createMockModuleView(),app=>{
          app.options[Constants.HISTORY.LIMIT]=100;
        });

        app.promise.then(()=>{
          expect(app.history.limit).toBe(100);
          done();
        });
      });

      it("custom HISTORY.LIMIT from module.options", done=>{
        let app = Ampere.app(createMockModuleView({[Constants.HISTORY.LIMIT]:100}));

        app.promise.then(()=>{
          expect(app.history.limit).toBe(100);
          done();
        });
      });

      it("invalid HISTORY.LIMIT(=null)", done=>{
        let app = Ampere.app(createMockModuleView({[Constants.HISTORY.LIMIT]:null}));
        app.promise.catch(done);
      });

      it("invalid HISTORY.LIMIT(=negative number)", done=>{
        let app = Ampere.app(createMockModuleView({[Constants.HISTORY.LIMIT]:-1}));
        app.promise.catch(done);
      });

      it("invalid HISTORY.LIMIT(=string)", done=>{
        let app = Ampere.app(createMockModuleView({[Constants.HISTORY.LIMIT]:'huhu'}));
        app.promise.catch(done);
      });
    });

    describe("execute", ()=>{
      describe("calls transition.transaction(transition,...params)", ()=>{
        let createMockModuleView = function() {
          let view;

          Ampere.domain(null, (domain, createModule)=>{
            createModule(null, (module, createState)=>{
              createState('inc', (state, createView, createTransition)=>{
                state.counter=0,
                state.params = [];

                view = createView(null, view=>{
                  util.createMockTemplate(view, '');
                });

                createTransition('immediate_immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    state.counter++;
                    return ()=>{
                      state.counter++;
                      state.params=params;
                    };
                  };
                });

                createTransition('immediate_promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    state.counter++;
                    return new Promise(resolve=>{
                      state.counter++;
                      state.params=params;
                      resolve();
                    });
                  };
                });

                createTransition('promise_immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return new Promise(resolve=>{
                      state.counter++;
                      resolve(()=>{
                        state.counter++;
                        state.params=params;
                      });
                    });
                  };
                });

                createTransition('promise_promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return new Promise(resolve=>{
                      state.counter++;
                      resolve(
                        new Promise(resolve=>{
                          state.counter++;
                          state.params=params;
                          resolve();
                        })
                      );
                    });
                  }
                });

              });
            });
          });

          return view;
        };

        const PARAMS = ["foo", "bar"];

        it("immediate_immediate", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.immediate_immediate, ...PARAMS).then(()=>{
            expect(app.view.state.counter).toBe(2);
            expect(app.view.state.params).toEqual(PARAMS);
            done();
          });
        });

        it("immediate_promise", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.immediate_promise, ...PARAMS).then(()=>{
            expect(app.view.state.counter).toBe(2);
            expect(app.view.state.params).toEqual(PARAMS);
            done();
          });
        });

        it("promise_immediate", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise_immediate, ...PARAMS).then(()=>{
            expect(app.view.state.counter).toBe(2);
            expect(app.view.state.params).toEqual(PARAMS);
            done();
          });
        });

        it("promise_promise", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise_promise, ...PARAMS).then(()=>{
            expect(app.view.state.counter).toBe(2);
            expect(app.view.state.params).toEqual(PARAMS);
            done();
          });
        });
      });

      describe("returns the non-function result of transition.transaction(...)", ()=>{
        let createMockModuleView = function() {
          let view;

          Ampere.domain(null, (domain, createModule)=>{
            createModule(null, (module, createState)=>{
              createState('inc', (state, createView, createTransition)=>{
                view = createView(null, view=>{
                  util.createMockTemplate(view, '');
                });

                createTransition('immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return params;
                  };
                });

                createTransition('promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return new Promise(resolve=>{
                      resolve(params);
                    });
                  };
                });

              });
            });
          });

          return view;
        };

        const PARAMS = ["foo", "bar"];

        it("immediate", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.immediate, ...PARAMS).then(params=>{
            expect(params).toEqual(PARAMS);
            done();
          });
        });

        it("promise", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise, ...PARAMS).then(params=>{
            expect(params).toEqual(PARAMS);
            done();
          });
        });
      });

      describe("aborts if transition.transaction throws an exception", done=>{
        const ERROR = "ooooops";

        let createMockModuleView = function() {
          let view;

          Ampere.domain(null, (domain, createModule)=>{
            createModule(null, (module, createState)=>{
              createState('inc', (state, createView, createTransition)=>{
                view = createView(null, view=>{
                  util.createMockTemplate(view, '');
                });

                createTransition('immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    throw new Error(ERROR);
                  };
                });

                createTransition('promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return new Promise((resolve, reject)=>{
                      reject(new Error(ERROR));
                    });
                  };
                });

              });
            });
          });

          return view;
        };

        it("immediate", done=>{
          let app = Ampere.app(createMockModuleView());
          app.execute(app.view.state.transitions.immediate).catch(ex=>{
            expect(ex.message.indexOf(ERROR)!==-1).toBe(true);
            done();
          });
        });

        it("promise", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise).catch(ex=>{
            expect(ex.message.indexOf(ERROR)!==-1).toBe(true);
            done();
          });
        });
      });

      describe("aborts if the redo function returned by transition.transaction(...) throws an exception", done=>{
        const ERROR = "ooooops";

        let createMockModuleView = function() {
          let view;

          Ampere.domain(null, (domain, createModule)=>{
            createModule(null, (module, createState)=>{
              createState('inc', (state, createView, createTransition)=>{
                view = createView(null, view=>{
                  util.createMockTemplate(view, '');
                });

                createTransition('immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return ()=>{
                      throw new Error(ERROR)
                    };
                  };
                });

                createTransition('promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return ()=>{
                      return new Promise((resolve, reject)=>{
                        reject(new Error(ERROR));
                      });
                    };
                  };
                });
              });
            });
          });

          return view;
        };

        it("immediate", done=>{
          let app = Ampere.app(createMockModuleView());
          app.execute(app.view.state.transitions.immediate).catch(ex=>{
            expect(ex.message.indexOf(ERROR)!==-1).toBe(true);
            done();
          });
        });

        it("promise", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise).catch(ex=>{
            expect(ex.message.indexOf(ERROR)!==-1).toBe(true);
            done();
          });
        });
      });

      describe("returns the undo function returned by the redo function returned by transition.transaction(...)", ()=>{
        let createMockModuleView = function() {
          let view;

          Ampere.domain(null, (domain, createModule)=>{
            createModule(null, (module, createState)=>{
              createState('inc', (state, createView, createTransition)=>{
                view = createView(null, view=>{
                  util.createMockTemplate(view, '');
                });

                createTransition('immediate_immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>()=>params[0];
                });

                createTransition('immediate_promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>new Promise(resolve=>{
                    resolve(()=>params[0]);
                  });
                });

                createTransition('promise_immediate',(transition)=>{
                  transition.transaction = (transition, ...params)=>new Promise(resolve=>resolve(()=>params[0]));
                });

                createTransition('promise_promise',(transition)=>{
                  transition.transaction = (transition, ...params)=>new Promise(resolve=>resolve(new Promise(resolve=>resolve(()=>params[0]))));
                });

              });
            });
          });

          return view;
        };

        let undoCalled = false;
        const PARAMS = [function undo() { return undoCalled=true; }];

        it("immediate_immediate", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.immediate_immediate, ...PARAMS).then(undo=>{
            undoCalled = false
            undo().then(result=>{
              expect(undoCalled).toBe(true);
              done();
            });
          });
        });

        it("immediate_promise", done=>{
          let app = Ampere.app(createMockModuleView());
          app.execute(app.view.state.transitions.immediate_promise, ...PARAMS).then(undo=>{
            undoCalled = false
            undo().then(result=>{
              expect(undoCalled).toBe(true);
              done();
            });
          });
        });

        it("promise_immediate", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise_immediate, ...PARAMS).then(undo=>{
            undoCalled = false
            undo().then(result=>{
              expect(undoCalled).toBe(true);
              done();
            });
          });
        });

        it("promise_promise", done=>{
          let app = Ampere.app(createMockModuleView());

          app.execute(app.view.state.transitions.promise_promise, ...PARAMS).then(undo=>{
            undoCalled = false
            undo().then(result=>{
              expect(undoCalled).toBe(true);
              done();
            });
          });
        });

      });
    });

    describe("then", ()=>{
      // TODO
    });

    describe("undo/redo", ()=>{
      describe("transition is undo/redoable (if undo/redo was provided)", done=>{
        let createMockModule = function() {
          let module;

          Ampere.domain(null, (domain, createModule)=>{
            module = createModule(null, (module, createState)=>{
              createState('s', (state, createView, createTransition)=>{
                state.value = 'a';

                let b = createView('b', view=>util.createMockTemplate(view, ''));
                let c = createView('c', view=>util.createMockTemplate(view, ''));

                createTransition('concat_b',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    let value = state.value,
                    redo = ()=>{
                      state.value = value + 'b';
                      return undo;
                    },
                    undo = ()=>{
                      state.value = value;
                      return redo;
                    };

                    return redo;
                  };
                }, b);

                createTransition('concat_c',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    let value = state.value,
                    redo = ()=>{
                      state.value = value + 'c';
                      return undo;
                    },
                    undo = ()=>{
                      state.value = value;
                      return redo;
                    };

                    return redo;
                  };
                }, c);

                createTransition('no_redo',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return ()=>{};
                  };
                }, b);
              });
            });
          });

          return module;
        };

        it("undo/redo a transition (canUndo,canRedo,canReset)", done=>spawn(function*() {
          let module = createMockModule(),
              app = Ampere.app(module.states.s.views.b)
          ;

            // wait for app (i.e. the history) to be ready
          yield app.promise;

            // undo should be disabled
          expect(app.history.canUndo).toBe(false);
          expect(app.view.state.value).toEqual('a');
          expect(app.view).toBe(app.view.state.views.b);
          expect(app.history.canReset).toBe(false);

          yield app.execute(app.view.state.transitions.concat_b);

            // undo should be enabled
          expect(app.history.canUndo).toBe(true);
          expect(app.view.state.value).toEqual('ab');
          expect(app.view).toBe(app.view.state.views.b);
          expect(app.history.canReset).toBe(true);

          yield app.history.undo();
          expect(app.view.state.value).toEqual('a');

            // undo should be disabled
          expect(app.history.canUndo).toBe(false);
          expect(app.history.canRedo).toBe(true);
          expect(app.view).toBe(app.view.state.views.b);
          expect(app.history.canReset).toBe(true);

          yield app.history.redo();
          expect(app.view.state.value).toEqual('ab');
          expect(app.view).toBe(app.view.state.views.b);

          yield app.execute(app.view.state.transitions.concat_b);
          expect(app.view.state.value).toEqual('abb');

          yield app.history.undo();
          expect(app.view.state.value).toEqual('ab');
          expect(app.history.canUndo).toBe(true);
          expect(app.history.canRedo).toBe(true);
          expect(app.history.canReset).toBe(true);

          expect(app.view).toBe(app.view.state.views.b);
          yield app.execute(app.view.state.transitions.concat_c);
          expect(app.view.state.value).toEqual('abc');
          expect(app.history.canUndo).toBe(true);
          expect(app.history.canRedo).toBe(false);
          expect(app.history.canReset).toBe(true);

            // view should now be "c"
          expect(app.view).toBe(app.view.state.views.c);

          yield app.history.undo();
          expect(app.view.toString()).toBe(app.view.state.views.b.toString());

          yield app.history.redo();
          expect(app.view.toString()).toBe(app.view.state.views.c.toString());

          yield app.history.undo();
          expect(app.view.toString()).toBe(app.view.state.views.b.toString());

          yield app.history.redo();
          expect(app.view.toString()).toBe(app.view.state.views.c.toString());

          yield app.execute(app.view.state.transitions.no_redo);
          expect(app.history.canReset).toBe(false);
          expect(app.history.canUndo).toBe(false);
          expect(app.history.canRedo).toBe(false);
          done();
        }));
      });

      describe("history.then(able) and history properties busy", done=>{
        let createMockModuleView = function() {
          let view;

          Ampere.domain(null, (domain, createModule)=>{
            createModule(null, (module, createState)=>{
              createState(null, (state, createView, createTransition)=>{
                  // will be used by the tests to control when undo and redo return
                state.fn = null;

                view = createView(null, view=>util.createMockTemplate(view, ''));

                createTransition('go',(transition)=>{
                  transition.transaction = (transition, ...params)=>{
                    return state.fn();
                  };
                });
              });
            });
          });

          return view;
        };

        it("history.then/history.busy will track transition completion", done=>spawn(function*() {
          let view = createMockModuleView(), app = Ampere.app(view);
            // wait for app (i.e. the history) to be ready
          yield app.promise;

            // simple transition
          let finish, p = new Promise(resolve=>finish=resolve);
          view.state.fn = ()=>{
            expect(app.history.busy).toBe(true);

            return p;
          };

          let tests = function*() {
              // should be immediately executed
            app.history.then(()=>expect(app.history.busy).toBe(false));

              // finish promise after 200ms
            setTimeout(finish, 100);

              // wait for transaction finished
            yield app.execute(app.view.state.transitions.go);
            expect(app.history.busy).toBe(false);

              // ensure thenable is fine
            yield app.history.then(()=>Promise.resolve(true));
          };
          yield *tests();

            // transition returning a redo function
          finish, p = new Promise(resolve=>finish=resolve);
          view.state.fn = ()=>{
            return ()=>{
              expect(app.history.busy).toBe(true);

              return p;
            }
          };
          yield *tests();

            // transition returning a redo function via promise
          finish, p = new Promise(resolve=>finish=resolve);
          view.state.fn = ()=>{
            return Promise.resolve(()=>{
              expect(app.history.busy).toBe(true);

              return p;
            });
          };
          yield *tests();

            // transition returning a redo function-with-promise-result returned via promise
          finish, p = new Promise(resolve=>finish=resolve);
          view.state.fn = ()=>{
            return Promise.resolve(()=>{
              return Promise.resolve().then(()=>{
                expect(app.history.busy).toBe(true);

                return p;
              })
            });
          };
          yield *tests();

          done();
        }));
      });
    });
  });

  let comment = `
  describe("functor", ()=>{
    let domain;
    beforeEach(()=>{
      domain = Ampere.domain(null, (domain, createModule)=>
        createModule(null, (module, createState)=>
          createState(null, (state, createView, createTransition)=>{
            createView(null, view=>{
              util.createMockTemplate(view, '');
            });

            createTransition('a', transition=>{
              transition.transaction = transition=>{

              };
            });
            createTransition('b', transition=>{
              transition.transaction = transition=>{

              };
            });
            createTransition('c', transition=>{
              transition.transaction = transition=>{

              };
            });
          })
        )
      )
    });

    it("instanceof App/Base, typeof 'function'", ()=>{
      let app = Ampere.app(domain.modules[Constants.DEFAULT].states[Constants.DEFAULT].views[Constants.DEFAULT]);

      expect(app instanceof App).toBe( true);
      expect(app instanceof Base).toBe( true);
        // would be nice but i have an idea how to do it ...
        // expect(app instanceof Function).toBe( true);
      // expect(typeof(app)=='function').toBe( true);
    });

    it("should be invokable with iterator<promise> as argument", done=>{
      let defaultState = domain.modules[Constants.DEFAULT].states[Constants.DEFAULT],
          app = Ampere.app(defaultState.views[Constants.DEFAULT])
      ;
      let visited = 0;
        /*
          this is es6 at its best : use a generator to do async operations sequential !!

          the yield statements below return the value provided to Promise.resolve(...)
          or throw an execption in case Promise.reject(...) was called
        */
      let iter = app(function*(resume) {
        expect(visited).toBe(0);

        expect(yield setTimeout(()=>resume(Promise.resolve("one hundred")), 100)).toBe("one hundred");
        expect(visited++).toBe(0);

        expect(yield setTimeout(()=>resume(Promise.resolve("four hundred")), 400)).toBe("four hundred");
        expect(visited++).toBe(1);

          // delegate to another generator
        yield* (function*() {
          expect(yield setTimeout(()=>resume(Promise.resolve("two hundred")), 200)).toBe("two hundred");
        })();
        expect(visited++).toBe(2);

        try {
          yield setTimeout(()=>resume(Promise.reject(new Error("should reject"))), 300);
            // should not happen
          visited+=10;
        } catch(ex) {
          expect(ex.message).toBe("should reject");
        }
        expect(visited++).toBe(3);

          // delegate to another generator
        try{
          yield* (function*() {
            yield setTimeout(()=>resume(Promise.reject(new Error("2nd reject"))), 200);
              // should not happen
            visited+=10;
          })();
        } catch(ex) {
          expect(visited).toBe(4);
          done();
        }
      });

      expect(visited).toBe(0);

        // start iterator
      iter.next();
    });

    it("should be steppable", ()=>{
        let defaultState = domain.modules[Constants.DEFAULT].states[Constants.DEFAULT],
            app = Ampere.app(defaultState.views[Constants.DEFAULT])
        ;

          // create a dummy ui
        class UIMock {
            constructor(app/*:App*/) {
              // (optional) render splash screen and wait until app is ready
            console.log("[splash-screen]");
            this.app = app;

              // wait for app to be ready
            app.promise.then(cb_retval=>{
                // render initial view
              console.log("[initial-view]");

              let UIOperation=(transition/*:Transition*/, options/*:Object={}*/)=>{

              };

              let trigger=(transitionName/*:String*/, options/*:Object={}*/, delayMilliseconds/*:Number=0*/)=>{
                let transition = defaultState.transitions[transitionName)];
                return new Promise(
                  (resolve,reject)=>setTimeout(
                    ()=>resolve(UIOperation.bind(this, transition, options)),
                    delayMilliseconds || 0
                  )
                );
              };

                // start state render loop
              let iter = app(function*(resume:Function) {
                  // simulate a bunch of queued events
                let eventQueue = [
                  trigger('a'),
                  trigger('b', {'some' : 'data'}),
                  trigger('c', {'some' : 'other data'})
                ];

                while( eventQueue.length) {
                  var uiTask = eventQueue.pop();
                }

                console.log("1");
                //let transition = yield triggerMockGuiEvent();
                console.log("2");
                //yield 2;
                console.log("3");
                //yield 3;
                console.log("after");
              });

                // start render loop
              iter.next();
            });
          }
        }

        let ui = new UIMock(app);
      });
    });
  `;
});
