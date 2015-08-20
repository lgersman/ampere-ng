import Ampere from '../src/ampere';
import Module from '../src/module';
import Constants from '../src/constants';

describe('Module', function () {
  it('instanceof/type', done=>{
    Ampere.domain(Constants.DEFAULT,domain=>{
      domain.createModule('foo', module=>{
        expect(module instanceof Module).toBe(true);
        expect(module.type).toBe('module');
        done();
      })
    });
  });

  it('name', done=>{
    Ampere.domain(Constants.DEFAULT,domain=>{
      domain.createModule(Constants.DEFAULT, module=>{
        expect(module.name).toBe(Constants.DEFAULT);
      });

      domain.createModule('mymodule', module=>{
        expect(module.name).toBe('mymodule');
      });

      done();
    });
  });

  it('namespace', done=>{
    Ampere.domain(Constants.DEFAULT,domain=>{
      domain.createModule('mymodule', module=>{
        expect(module.options[Ampere.NAME]).toEqual(module.name);
          // namespace===[domain.name].[module.name] for domain modules
        expect(module.options[Ampere.NAMESPACE]).toEqual(`["Ampere"].[default].[${JSON.stringify(module.name)}]`);
        done();
      });
    });
  });

  describe('module.createState()', ()=>{
    it('create state with same name should fail', done=>{
      Ampere.domain(Constants.DEFAULT,domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          module.createState('foo', state=>{
            state.createView(Constants.DEFAULT, ()=>{});
          });

          expect(()=>module.createState('foo', state=>{})).toThrow();
          done();
        });
      });
    });

    it('create state with same name (the default) should fail', done=>{
      Ampere.domain(Constants.DEFAULT,domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          module.createState(Constants.DEFAULT, state=>{
            state.createView(Constants.DEFAULT, ()=>{});
          });

          expect(()=>module.createState(Constants.DEFAULT, state=>{})).toThrow();
          done();
        });
      });
    });

    it('create state without view should fail', done=>{
      Ampere.domain(Constants.DEFAULT,domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          let state = module.createState(Constants.DEFAULT, state=>{});
            // promise should be reject because state callback has not created any view
          state.promise.catch(done);
        });
      });
    });
  });

  describe('createTransition()', ()=>{

    it('create transition', done=>{
      Ampere.domain(Constants.DEFAULT, domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          let view;

          module.createState(Constants.DEFAULT, state=>{
            view = state.createView(Constants.DEFAULT, view=>view.createTemplate('mytemplate'));
          });

          expect(()=>module.createTransition(Constants.DEFAULT, transition=>{}, view)).not.toThrow();
          done();
        });
      });
    });

    it('create transition without 3rd argument should fail', done=>{
      Ampere.domain(Constants.DEFAULT, domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          module.createState(Constants.DEFAULT, state=>{
            state.createView(Constants.DEFAULT, view=>{});
          });

          expect(()=>module.createTransition(Constants.DEFAULT, transition=>{})).toThrow();
          done();
        });
      });
    });

    it('create transition with 3rd argument function<view> should work', done=>{
      Ampere.domain(Constants.DEFAULT, domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          let _view;
          module.createState(Constants.DEFAULT, state=>{
            _view = state.createView(Constants.DEFAULT, view=>view.createTemplate('mytemplate'));
          });
          expect(()=>module.createTransition(Constants.DEFAULT, transition=>{}, ()=>_view)).not.toThrow();

          expect(module.transitions[''].target).toBe(_view);
          expect(module.transitions[''].state).toBe(undefined);
          expect(module.transitions[''].module).toBe(module);
          done();
        });
      });
    });

    it('create transition should produce a transition with a transparent "view" property', done=>{
      Ampere.domain(Constants.DEFAULT, domain=>{
        domain.createModule(Constants.DEFAULT, module=>{
          let view;
          module.createState(Constants.DEFAULT, state=>{
            view = state.createView(Constants.DEFAULT, view=>view.createTemplate('mytemplate'));
          });

          const transition = module.createTransition(Constants.DEFAULT, transition=>{}, view);

            // inject mock with partial app
          module.app = {};

            // test transition.view === appMock.view
          expect(transition.view).toBe(undefined);

            // modify state
          module.app.view = view;
            // test again transition.view === appMock.view
          expect(transition.view).toBe(view);

          done();
        });
      });
    });
  });

  it('options', done=>{
    Ampere.domain(Constants.DEFAULT,domain=>{
      domain.createModule('mymodule', module=>{
        expect(module.options).toBeDefined();
        expect(typeof(module.options)).toBe('object');
        done();
      });
    });
  });
});
