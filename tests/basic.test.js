const Store = require('../index.cjs.js');
const R = require('ramda');

describe('Store', () => {
  it('should check existence of methods and data', () => {
    const state = new Store({ test: '123' });
    expect(typeof state).toEqual('object');
    expect(typeof state.unsubscribe).toBe('function');
    expect(typeof state.subscribe).toBe('function');
    expect(typeof state.subscribeAll).toBe('function');
    expect(typeof state.update).toBe('function');
    expect(typeof state.get).toBe('function');
    expect(typeof state.destroy).toBe('function');
    state.destroy();
  });

  it('should call Store', () => {
    const state = new Store({ a: 'a', b: 'b', c: { d: 'd' } });
    let $d;
    state.subscribe('c.d', (d) => {
      $d = d;
    });
    expect($d).toEqual('d');
    state.destroy();
  });

  it('should update and watch', () => {
    const state = new Store({
      test: {
        test2: 123
      }
    });
    let test2 = 0;
    let event = 0;
    state.subscribe('test.test2', (value) => {
      test2 = value;
      if (event === 0) {
        expect(value).toEqual(123);
      } else {
        expect(value).toEqual(100);
      }
      event++;
    });
    expect(test2).toEqual(123);
    state.update('test.test2', (oldValue) => {
      return 100;
    });
    expect(test2).toEqual(100);
    state.destroy();
  });

  it('should watch all paths', () => {
    const state = new Store({ x: 10, y: 20, z: { xyz: 50 } });
    let result = {};
    const paths = [];
    state.subscribeAll(['x', 'y', 'z.xyz'], (path, value) => {
      result = R.set(R.lensPath(path.split('.')), value, result);
      paths.push(path);
    });
    expect(result).toEqual({ x: 10, y: 20, z: { xyz: 50 } });
    expect(paths).toEqual(['x', 'y', 'z.xyz']);
    state.destroy();
  });

  it('should accept value instead of function inside update', () => {
    const state = new Store({ x: 10, y: 20, z: { xyz: 50 } });
    expect(state.get()).toEqual({ x: 10, y: 20, z: { xyz: 50 } });
    state.update('z.xyz', 'string instead of fn');
    expect(state.get('z.xyz')).toEqual('string instead of fn');
    state.destroy();
  });

  it('should match wildcards', () => {
    const state = new Store({ one: { two: { three: { four: { five: 5 } } } } });
    const paths = [];
    state.subscribe('one.*.three', (value, path) => {
      paths.push(path);
    });
    state.subscribe('one.**', (value, path) => {
      paths.push(path);
    });
    state.subscribe('one.*.*.four.*', (value, path) => {
      paths.push(path);
    });
    expect(paths.length).toEqual(0);
    const fullPath = 'one.two.three.four.five';
    state.update(fullPath, 'mod');
    expect(paths).toEqual([fullPath, fullPath]);
  });
});
