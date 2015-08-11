import Ampere from '../src/ampere';
import State from '../src/state';
import Constants from '../src/constants';

describe('State', function () {
  it('instanceof/type State', done=>{
    Ampere.domain(null, domain=>{
      domain.createModule(null, module=>{
        module.createState('foo', state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');
          });

          expect(state instanceof State).toBe(true);
          expect(state.type).toBe('state');
          done();
        });
      });
    });
  });

  it('default name', done=>{
    Ampere.domain(null, domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');
          });

          expect(state.name).toBe(Constants.DEFAULT);
          done();
        });
      });
    });
  });

  it('name', done=>{
    Ampere.domain(null, domain=>{
      domain.createModule(null, module=>{
        module.createState('foo', state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');
          });

          expect(state.name).toBe('foo');
          done();
        });
      });
    });
  });

  it('namespace', done=>{
    Ampere.domain(null, domain=>{
      domain.createModule('mymodule', module=>{
        module.createState('foo', state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');
          });

          expect(state.options[Ampere.NAME]).toEqual(state.name);
            // namespace===[domain.name].[module.name].[state.name] for ampere states
          expect(state.options[Ampere.NAMESPACE]).toEqual(`["Ampere"].[default].[${JSON.stringify(module.name)}].[${JSON.stringify(state.name)}]`);
          done();
        });
      });
    });
  });

  describe('state.createView()', ()=>{
    it('view with same name should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView('foo', view=>{});

            expect(()=>state.createView('foo', view=>{})).toThrow();
            done();
          });
        });
      });
    });

    it('view with same name (the default) should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{});

            expect(()=>state.createView(null, view=>{})).toThrow();
            done();
          });
        });
      });
    });
  });

  it('options', done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState('foo', state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');
          });

          expect(state.options).toBeDefined();
          expect(typeof(state.options)).toBe('object');
          done();
        });
      });
    });
  });
});
