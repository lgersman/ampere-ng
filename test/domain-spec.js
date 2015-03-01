import Ampere from "../src/ampere";
import Domain from "../src/domain";
import Constants from "../src/constants";

describe("Domain", function () {
	it("instanceof/type Domain", ()=>{
		let domain = Ampere.domain(null,(domain, createModule)=>{});

		expect(domain instanceof Domain).toBe( true);
		expect(domain.type).toBe( 'domain');
	});

	it("name", ()=>{
		let domain = Ampere.domain(null,(domain, createModule)=>{});
		expect(domain.name).toBe( Constants.DEFAULT);

		domain = Ampere.domain('myampere',(domain, createModule)=>{});
		expect(domain.name).toBe( 'myampere');
	});

	it("namespace", ()=>{
		let domain = Ampere.domain(null,(domain, createModule)=>{});
		expect(domain.options[Ampere.NAME]).toEqual( domain.name);
			// namespace===name for domain objects
		expect(domain.options[Ampere.NAMESPACE]).toEqual( '["Ampere"].[default]');
	});

	it("create module with same name should fail", done=>{
		Ampere.domain(null,(domain, createModule)=>{
			createModule('mymodule', (module, createState)=>{
			});

			expect(()=>createModule('mymodule', (module, createState)=>{	})).toThrow();

			done();
		});
	});

	it("options", ()=>{
		Ampere.options.foo = 'bar';

		let domain = Ampere.domain(null,(domain, createModule)=>{});
		expect(domain.options).toBeDefined();
		expect(typeof(domain.options)).toBe('object');

		expect(domain.options.foo).toBe('bar');
	});
});
