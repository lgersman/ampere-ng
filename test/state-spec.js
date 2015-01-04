import Ampere from "../src/ampere";
import State from "../src/state";
import Constants from "../src/constants";

import util from "./util";

describe("State", function () {
	it("instanceof/type State", done=>{
		Ampere.domain(null, (domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState('foo', (state, createView, createTransition)=>{
					createView(null, (view,createTemplate)=>{
						util.createMockTemplate(view, '')
					});

					expect(state instanceof State).toBe(true);
					expect(state.type).toBe('state');
					done();
				});
			});
		});
	});

	it("default name", done=>{
		Ampere.domain(null, (domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState(null, (state, createView, createTransition)=>{
					createView(null, (view,createTemplate)=>{
						util.createMockTemplate(view, '')
					});

					expect(state.name).toBe(Constants.DEFAULT);
					done();
				});
			});
		});
	});

	it("name", done=>{
		Ampere.domain(null, (domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState('foo', (state, createView, createTransition)=>{
					createView(null, (view,createTemplate)=>{
						util.createMockTemplate(view, '')
					});

					expect(state.name).toBe('foo');
					done();
				});
			});
		});
	});

	it("namespace", done=>{
		Ampere.domain(null, (domain, createModule)=>{
			createModule('mymodule', (module, createState)=>{
				createState('foo', (state, createView, createTransition)=>{
					createView(null, (view,createTemplate)=>{
						util.createMockTemplate(view, '')
					});

					expect(state.options[Ampere.NAME]).toEqual(state.name);
						// namespace===[domain.name].[module.name].[state.name] for ampere states
					expect(state.options[Ampere.NAMESPACE]).toEqual(`Ampere.[default].${module.name}.${state.name}`);
					done();
				});
			});
		});
	});

	describe("createView()", ()=>{
		it("view with same name should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState(null, (state, createView, createTransition)=>{
						createView('foo', view=>{});

						expect(()=>createView('foo', view=>{})).toThrow();
						done();
					});
				});
			});
		});

		it("view with same name (the default) should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState(null, (state, createView, createTransition)=>{
						createView(null, view=>{});

						expect(()=>createView(null, view=>{})).toThrow();
						done();
					});
				});
			});
		});
	});

	describe("createTransition()", ()=>{
		it("create transition with same name should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState(null, (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});

						createTransition('foo', transition=>{});
						expect(()=>createTransition('foo', transition=>{})).toThrow();
						done();
					});
				});
			});
		});

		it("create transition with same name (the default) should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState(null, (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});

						createTransition(null, transition=>{});

						expect(()=>createTransition(null, transition=>{})).toThrow();
						done();
					});
				});
			});
		});

		it("create transition with non-state-object as target should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState('b', (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});

						let notAState = {};

						expect(()=>createTransition(null, transition=>{}, notAState)).toThrow();
						done();
					});
				});
			});
		});

		it("create transition with state-object as target should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					let b = { };
					b.state = createState('a', (state, createView, createTransition)=>{
						b.view = createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});
					});

					createState('b', (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});
						let transition = createTransition(null, transition=>{}, module.states['a']);
						expect( transition.view).toBe( b.view);
						expect( transition.view.state).toBe( b.state);
						//expect(()=>createTransition(null, transition=>{})).toThrow();
						done();
					});
				});
			});
		});

		it("create transition with state-object-without-default-view as target should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState('a', (state, createView, createTransition)=>{
						createView('x', ()=>{});
						createView('y', ()=>{});
					});

					createState('b', (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});

						expect(()=>createTransition(null, transition=>{}, module.states['a'])).toThrow();
						done();
					});
				});
			});
		});

		it("create transition with state/view-object-of-different-domain as target should fail", done=>{
			let foreignDomainState;
			Ampere.domain(null, (domain, createModule)=>
				createModule(null, (module, createState)=>
					createState(null, (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});

						foreignDomainState = state;
					})
				)
			);

			Ampere.domain(null, (domain, createModule)=>
				createModule(null, (module, createState)=>
					createState(null, (state, createView, createTransition)=>{
						createView(null, (view,createTemplate)=>{
							util.createMockTemplate(view, '')
						});

						expect(()=>createTransition(null, transition=>{}, foreignDomainState)).toThrow();

						expect(()=>createTransition(null, transition=>{}, foreignDomainState.views[Constants.DEFAULT])).toThrow();
						done();
					})
				)
			);
		});
	});

	it("options", done=>{
		let a = Ampere.domain(null,(domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState('foo', (state, createView, createTransition)=>{
					createView(null, (view,createTemplate)=>{
						util.createMockTemplate(view, '')
					});

					expect(state.options).toBeDefined();
					expect(typeof(state.options)).toBe('object');
					done();
				});
			});
		});
	});
});
