import Base from '../src/base';
import Ampere from '../src/ampere';
import Constants from '../src/constants';

describe('Base', function () {
  class Mock extends Base {
    constructor(name:string=Constants.DEFAULT, type:string='mock', parentOptions) {
      super(name, type, parentOptions);
    }
  }

  it('instanceof/type Base', ()=>{
    let mock = new Mock();

    expect(mock instanceof Mock).toBe(true);
    expect(mock instanceof Base).toBe(true);
    expect(mock.type).toBe('mock');
  });

  it('name/namespace', ()=>{
    let parent = new Mock('foo');
    let mock = new Mock('bar', undefined, parent.options);

    expect(mock.name).toEqual('bar');
    expect(parent.options[Ampere.NAMESPACE]).toEqual('["foo"]');
    expect(mock.options[Ampere.NAMESPACE]).toEqual('["foo"].["bar"]');
  });

  it('assert()', ()=>{
    let mock = new Mock();

    let message=undefined;
    try {  mock.assert(3+4);  } catch(e) { message=e.message; }
    expect(message).toEqual(undefined);

    message=undefined;
    try {  mock.assert(false);  } catch(e) { message=e.message; }
    expect(message).toEqual(`[mock:[default]] : assert(...) failed`);

    message=undefined;
    try {  mock.assert(false, 'something went wrong');  } catch(e) { message=e.message; }
    expect(message).toEqual(`[mock:[default]] : something went wrong`);

    message=undefined;
    try {  mock.assert(()=>null===true, 'something went wrong');  } catch(e) { message=e.message; }
    expect(message).toEqual(`[mock:[default]] : something went wrong`);

      // test msg closure gets called when condition evaluates to false
    try {
      mock.assert(()=>null===true, ()=>'i was called');
    } catch(e) { message=e.message; }
    expect(message).toEqual(`[mock:[default]] : i was called`);

      // test msg closure gets NOT called when condition evaluates to true
    try {
      var called=false;
      mock.assert(()=>true===true, ()=>called=true && 'i was called');
    } catch(e) { message=e.message; }
    expect(called).toBe(false);
  });

  describe('promise()', ()=>{
    it('Base._PROMISIFY should be inaccessible after calling options[Base._PROMISIFY]', ()=>{
      let mock = new Mock();
      expect(mock.options[Base._PROMISIFY]).toBeDefined();
      mock.options[Base._PROMISIFY](()=>{});
      expect(mock.options[Base._PROMISIFY]).not.toBeDefined();
    });

    it('should resolve to the callback non-promise-return-value', done=>{
      let mock = new Mock();
      mock.options[Base._PROMISIFY](()=>'myretval');
      mock.promise.then(val=>{
        expect(val).toBe('myretval');
        done();
      });
    });

    it('should reject to the error throwed by the callback', done=>{
      let mock = new Mock();
      mock.options[Base._PROMISIFY](()=>{
        throw new Error('did not work');
      });
      mock.promise.catch(err=>{
        expect(err instanceof Error).toBe(true);
        expect(err.message).toBe('did not work');
        done();
      });
    });

    it('should provide arguments to the callback function', done=>{
      let mock = new Mock();
      mock.options[Base._PROMISIFY]((...args)=>args, 4, 5, 3);
      mock.promise.then(val=>{
        expect(val).toEqual([mock, 4, 5, 3]);
        done();
      });
    });

    it('should provide base instance to the callback function', done=>{
      let mock = new Mock();
      mock.options['factor']=2;
      mock.options[Base._PROMISIFY](
        (mock, ...args)=>args.reduce((sum, val)=>mock.options['factor']*(sum+val), 0),
        4, 5, 3
      );
      mock.promise.then(val=>{
        expect(val).toBe(58);
        done();
      });
    });

    it('should resolve to the value of the promise returned by callback', done=>{
      let mock = new Mock();
      mock.options[Base._PROMISIFY](()=>Promise.resolve('myretval'));
      mock.promise.then(val=>{
        expect(val).toBe('myretval');
        done();
      });
    });

    it('should resolve to the rejected value of the promise returned by callback', done=>{
      let mock = new Mock();
      mock.options[Base._PROMISIFY](()=>new Promise((resolve,reject)=>reject('my error')));
      mock.promise.catch(val=>{
        expect(val).toBe('my error');
        done();
      });
    });
  });

  it('options', ()=>{
    let mock = new Mock();

    expect(mock.options).toBeDefined();
    expect(typeof(mock.options)).toBe('object');
  });
});
