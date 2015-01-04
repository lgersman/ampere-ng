import Ampere from "../src/ampere";
import Module from "../src/module";
import Constants from "../src/constants";

import util from "./util";

describe("Module", function () {
	it("instanceof/type", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule('foo', (module, createState)=>{
				expect(module instanceof Module).toBe( true);
				expect(module.type).toBe('module');
				done();
			})
		});
	});

	it("name", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule(Constants.DEFAULT, (module, createState)=>{
				expect(module.name).toBe(Constants.DEFAULT);
			});

			createModule('mymodule', (module, createState)=>{
				expect(module.name).toBe('mymodule');
			});

			done();
		});
	});

	it("namespace", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule('mymodule', (module, createState)=>{
				expect(module.options[Ampere.NAME]).toEqual(module.name);
					// namespace===[domain.name].[module.name] for domain modules
				expect(module.options[Ampere.NAMESPACE]).toEqual( `Ampere.[default].${module.name}`);
				done();
			});
		});
	});

	describe("createState()", ()=>{
		it("create state with same name should fail", done=>{
			Ampere.domain(null,(domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState('foo', (state, createView, createTransition)=>{
						createView(null, ()=>{});
					});

					expect(()=>createState('foo', (state, createView, createTransition)=>{})).toThrow();
					done();
				});
			});
		});

		it("create state with same name (the default) should fail", done=>{
			Ampere.domain(null,(domain, createModule)=>{
				createModule(null, (module, createState)=>{
					createState(null, (state, createView, createTransition)=>{
						createView(null, ()=>{});
					});

					expect(()=>createState(null, (state, createView, createTransition)=>{})).toThrow();
					done();
				});
			});
		});

		it("create state without view should fail", done=>{
			Ampere.domain(null,(domain, createModule)=>{
				createModule(null, (module, createState)=>{
					let state = createState(null, (state, createView, createTransition)=>{});
						// promise should be reject because state callback has not created any view
					state.promise.catch(done);
				});
			});
		});
	});

	describe("createTransition()", ()=>{

		it("create transition", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState, createTransition)=>{
					let _state;
					createState(null, (state, createView, createTransition)=>{
						createView(null, ()=>{});

						_state = state;
					});

					expect(()=>createTransition(null, transition=>{}, _state)).not.toThrow();

					done();
				});
			});
		});

		it("create transition without 3rd argument should fail", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState, createTransition)=>{
					let _state;
					createState(null, (state, createView, createTransition)=>{
						createView(null, ()=>{});

						_state = state;
					});

					expect(()=>createTransition(null, transition=>{})).toThrow();
					done();
				});
			});
		});

		it("create transition with 3rd argument function<view> should work", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState, createTransition)=>{
					let _state, _view;
					createState(null, (state, createView, createTransition)=>{
						_view = createView(null, ()=>{});

						_state = state;
					});
					expect(()=>createTransition(null, transition=>{}, ()=>_view)).not.toThrow();
					expect(module.transitions[''].view).toBe(_view);
					expect(module.transitions[''].state).toBe(undefined);
					expect(module.transitions[''].module).toBe(_state.module);
					done();
				});
			});
		});

		it("create transition should produce a transition with a transparent 'state' property", done=>{
			Ampere.domain(null, (domain, createModule)=>{
				createModule(null, (module, createState, createTransition)=>{
					let _state;
					createState(null, (state, createView, createTransition)=>{
						createView(null, ()=>{});

						_state = state;
					});

						// inject mock with partial app
					let appMock = {
						view : {
							state : null
						}
					};
					module.app = appMock;

					createTransition(null, transition=>{
							// test transition.state === appMock.view.state
						expect(transition.state).toBe(null);

							// modify state
						appMock.view.state = _state;
							// test again transition.state === appMock.view.state
						expect(transition.state).toBe( _state);

						done();
					}, _state);
				});
			});
		});
	});

	it("options", done=>{
		let a = Ampere.domain(null,(domain, createModule)=>{
			createModule('mymodule', (module, createState)=>{
				expect(module.options).toBeDefined();
				expect(typeof(module.options)).toBe('object');
				done();
			});
		});
	});
});
