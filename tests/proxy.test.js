const State = require("../index.cjs.js");

describe("Proxy", () => {
  it("should get value by proxy", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.proxy.x.y.z = 20;
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should get value by proxy inside function", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.proxy.x.y.z = (val) => {
      return val + 10;
    };
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should set object by proxy", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.proxy.x.y = { z: 20 };
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should get value by proxy inside function", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.proxy.x.y = (val) => {
      return { z: val.z + 10 };
    };
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should run collection with proxy", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.collect();
    state.proxy.x.y = { z: 20 };
    expect(values.length).toEqual(1);
    expect(state.proxy.x.y.z).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    state.executeCollected();
    expect(values.length).toEqual(2);
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should run collection with proxy function", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.collect();
    state.$$$.x.y = (val) => {
      return { z: val.z + 10 };
    };
    expect(values.length).toEqual(1);
    expect(state.proxy.x.y.z).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    state.executeCollected();
    expect(values.length).toEqual(2);
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should update by update fn too", () => {
    const state = new State({ x: { y: { z: 10 } } });
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.collect();
    state.update("x.y", (val) => {
      return { z: val.z + 10 };
    });
    expect(values.length).toEqual(1);
    expect(state.proxy.x.y.z).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    state.executeCollected();
    expect(values.length).toEqual(2);
    //console.log(state.data);
    expect(values[1]).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });
});
