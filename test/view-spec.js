import Ampere from '../src/ampere';
import View from '../src/view';
import Constants from '../src/constants';

describe('View', function () {
  it('instanceof/type View', done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            view.createTemplate('mytemplate');

            expect(view instanceof View).toBe( true);
            expect(view.type).toBe('view');
            done();
          });
        });
      });
    });
  });

  it('default name', done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView(null, view=>{
            expect(view.name).toBe(Constants.DEFAULT);
            done();
          });
        });
      });
    });
  });

  it('name', done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView('foo', view=>{
            expect(view.name).toBe('foo');
            done();
          });
        });
      });
    });
  });

  it('namespace', done=>{
    Ampere.domain(null,domain=>{
      domain.createModule('mymodule', module=>{
        module.createState('foo', state=>{
          expect(state.options[Ampere.NAME]).toEqual( state.name);
            state.createView('foo', view=>{
                // namespace===[domain.name].[module.name].[state.name].[view.name] for ampere views
              expect(view.options[Ampere.NAMESPACE]).toEqual( `["Ampere"].[default].[${JSON.stringify(module.name)}].[${JSON.stringify(state.name)}].[${JSON.stringify(view.name)}]`);
              done();
            });
        });
      });
    });
  });

  describe('createTransition()', ()=>{
    it('create transition with same name should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              view.createTransition('foo', transition=>{});
              expect(()=>view.createTransition('foo', transition=>{})).toThrow();
              done();
            });
          });
        });
      });
    });

    it('create transition with same name (the default) should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');
              view.createTransition(null, transition=>{});

              expect(()=>view.createTransition(null, transition=>{})).toThrow();
              done();
            });
          });
        });
      });
    });

    it('create transition with non-view-object as target should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          module.createState('b', state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              let notAView = {};

              expect(()=>view.createTransition(null, transition=>{}, notAView)).toThrow();
              done();
            });
          });
        });
      });
    });

    it('create transition with state-object as target should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          let b = { };
          b.state = module.createState('a', state=>{
            b.view = state.createView(null, view=>{
              view.createTemplate('mytemplate');
            });
          });

          module.createState('b', state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              expect(()=>view.createTransition(null, transition=>{}, module.states['a'])).toThrow();
              done();
            });
          });
        });
      });
    });

    it('create transition with state-object-without-default-view as target should fail', done=>{
      Ampere.domain(null, domain=>{
        domain.createModule(null, module=>{
          module.createState('a', state=>{
            state.createView('x', ()=>{});
            state.createView('y', ()=>{});
          });

          module.createState('b', state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              expect(()=>view.createTransition(null, transition=>{}, module.states['a'])).toThrow();
              done();
            });
          });
        });
      });
    });

    it('create transition with state/view-object-of-different-domain as target should fail', done=>{
      let foreignDomainState;
      Ampere.domain(null, domain=>
        domain.createModule(null, module=>
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');
            });

            foreignDomainState = state;
          })
        )
      );

      Ampere.domain(null, domain=>
        domain.createModule(null, module=>
          module.createState(null, state=>{
            state.createView(null, view=>{
              view.createTemplate('mytemplate');

              expect(()=>view.createTransition(null, transition=>{}, foreignDomainState)).toThrow();

              expect(()=>view.createTransition(null, transition=>{}, foreignDomainState.views[Constants.DEFAULT])).toThrow();
              done();
            });
          })
        )
      );
    });
  });

  it('options', done=>{
    Ampere.domain(null,domain=>{
      domain.createModule(null, module=>{
        module.createState(null, state=>{
          state.createView('foo', view=>{
            expect(view.options).toBeDefined();
            expect(typeof(view.options)).toBe('object');
            done();
          });
        });
      });
    });
  });
});
