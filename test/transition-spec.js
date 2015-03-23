import Ampere from "../src/ampere";
import State from "../src/state";
import Transition from "../src/transition";
import Constants from "../src/constants";

describe("Transition", ()=>{
  it("instanceof/type Transition", done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition(null, transition=>{
              expect(transition instanceof Transition).toBe( true);
              expect(transition.type).toBe('transition');
              done();
            });
          });
        });
      });
    });
  });

  it("default name", done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition(null, transition=>{
              expect(transition.name).toBe(Constants.DEFAULT);
              done();
            });
          });
        });
      });
    });
  });

  it("name", done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition('foo', transition=>{
              expect(transition.name).toBe('foo');
              done();
            });
          });
        });
      });
    });
  });

  it("view", done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition(null, transition=>{
              expect(transition.view).toBe(view);
              done();
            });
          });
        });
      });
    });
  });

  describe("disabled", ()=>{
    it("default(disabled===false)", done=>{
      Ampere.domain(null,domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              view.createTransition(null, transition=>{
                transition.disabled.then(value=>{
                  expect(value).toBe(false);
                  done();
                });
              });
            });
          });
        });
      });
    });

    it("set disabled to static value", done=>{
      Ampere.domain(null,domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              view.createTransition(null, (async function(transition) {
                transition.disabled = true;

                let val2 = await transition.disabled;
                expect(val2).toBe(true);

                transition.disabled = "This feature is disabled";
                let val3 = await transition.disabled;
                expect(val3).toBe("This feature is disabled");

                done();
              }));
            });
          });
        });
      });
    });

    it("set disabled to promise", done=>{
      Ampere.domain(null,domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              view.createTransition(null, (async function(transition) {
                const MESSAGE = "wrong input";
                transition.disabled = Promise.resolve(MESSAGE);

                let val2 = await transition.disabled;
                expect(val2).toEqual("wrong input");

                const EXCEPTION_MESSAGE = "This feature is disabled";
                transition.disabled = Promise.reject(new Error(EXCEPTION_MESSAGE));
                try {
                  let val3 = await transition.disabled;
                  throw new Error("should not happen");
                } catch(ex) {
                  expect(ex.message).toEqual(EXCEPTION_MESSAGE);
                }

                done();
              }));
            });
          });
        });
      });
    });

    it("set disabled to function", done=>{
      Ampere.domain(null,domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              view.createTransition(null, (async function(transition){
                let retval = 1000;
                transition.disabled = transition=>retval;

                let val1 = await transition.disabled;
                expect(!!val1).toBe(true);

                retval=0;
                let val2 = await transition.disabled;
                expect(!!val2).toBe(false);

                transition.disabled=(_transition)=>{
                  expect(_transition).toBe( transition);
                  return ["foo", "bar"];
                };
                let val3 = await transition.disabled;
                expect(val3).toEqual(["foo", "bar"]);

                done();
              }));
            });
          });
        });
      });
    });
  });

  it("transaction", done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition(null, (async function(transition) {
                // transaction should have transition as first parameter and given parameters at call as rest
              transition.transaction = (transition,...args)=>{ return {transition, args}};
              let val2 = await transition.transaction("hello", "world");
              expect(val2).toEqual({transition, args : ["hello", "world"]});

              done();
            }));
          });
        });
      });
    });
  });

  it("namespace", done=>{
    Ampere.domain(null,domain=>{
      domain.createModule('mymodule', module=>{
        module.createState('foo', state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition('foo', transition=>{
              expect(transition.options[Ampere.NAME]).toEqual(transition.name);
                // namespace===[domain.name].[module.name].[state.name].[transition.name] for ampere views
              expect(transition.options[Ampere.NAMESPACE]).toEqual( `["Ampere"].[default].[${JSON.stringify(module.name)}].[${JSON.stringify(state.name)}].[default].[${JSON.stringify(transition.name)}]`);
              done();
            });
          });
        });
      });
    });
  });

  it("options", done=>{
    let a = Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            view.createTransition('foo', transition=>{
              expect(transition.options).toBeDefined();
              expect(typeof(transition.options)).toBe('object');
              done();
            });
          });
        });
      });
    });
  });
});
