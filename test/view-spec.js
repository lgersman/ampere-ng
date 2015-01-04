import Ampere from "../src/ampere";
import State from "../src/state";
import View from "../src/view";
import Constants from "../src/constants";

import util from "./util";

describe("View", function () {
	it("instanceof/type View", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState(null, (state, createView, createTransition)=>{
					createView(null, (view, createTemplate)=>{
						util.createMockTemplate(view, '');

						expect(view instanceof View).toBe( true);
						expect(view.type).toBe('view');
						done();
					});
				});
			});
		});
	});

	it("default name", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState(null, (state, createView, createTransition)=>{
					createView(null, (view, createTemplate)=>{
						expect(view.name).toBe(Constants.DEFAULT);
						done();
					});
				});
			});
		});
	});

	it("name", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState(null, (state, createView, createTransition)=>{
					createView('foo', (view, createTemplate)=>{
						expect(view.name).toBe('foo');
						done();
					});
				});
			});
		});
	});

	it("namespace", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule('mymodule', (module, createState)=>{
				createState('foo', (state, createView, createTransition)=>{
					expect(state.options[Ampere.NAME]).toEqual( state.name);
						createView('foo', (view, createTemplate)=>{
								// namespace===[domain.name].[module.name].[state.name].[view.name] for ampere views
							expect(view.options[Ampere.NAMESPACE]).toEqual( `Ampere.[default].${module.name}.${state.name}.${view.name}`);
							done();
						});
				});
			});
		});
	});

	it("options", done=>{
		let a = Ampere.domain(null,(domain, createModule)=>{
			createModule(null, (module, createState)=>{
				createState(null, (state, createView, createTransition)=>{
					createView('foo', (view, createTemplate)=>{
						expect(view.options).toBeDefined();
						expect(typeof(view.options)).toBe('object');
						done();
					});
				});
			});
		});
	});
});
