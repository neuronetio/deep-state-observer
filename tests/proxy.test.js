const State = require("../index.cjs.js");

const options = { useProxy: true, useObjectMaps: false };

describe("Proxy", () => {
  it("should get value by proxy", () => {
    const state = new State({ x: { y: { z: 10 } } }, options);
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
    const state = new State({ x: { y: { z: 10 } } }, options);
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
    const state = new State({ x: { y: { z: 10 } } }, options);
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
    const state = new State({ x: { y: { z: 10 } } }, options);
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
    const state = new State({ x: { y: { z: 10 } } }, options);
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
    const state = new State({ x: { y: { z: 10 } } }, options);
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
    const state = new State({ x: { y: { z: 10 } } }, options);
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.collect();
    //console.log(state.$$$.x.y[state.proxyProperty]);
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

  it("should have proxyProperty data", () => {
    const state = new State({ x: { y: { z: 10 } } }, options);
    // console.log(state.data);
    expect(state.data.x.y.z).toEqual(10);
    expect(state.proxy.x.y.z).toEqual(10);
    expect(typeof state.$$$[state.proxyProperty]).toEqual("object");
    expect(typeof state.$$$.x[state.proxyProperty]).toEqual("object");
    expect(typeof state.$$$.x.y[state.proxyProperty]).toEqual("object");
    //console.log(state.proxyProperty, state.$$$.x.y[state.proxyProperty]);
    const values = [];
    state.subscribe("x.y.z", (value) => {
      values.push(value);
    });
    expect(values[0]).toEqual(10);
    state.collect();
    state.$$$.x.y = (val) => {
      expect(state.isSaving(["x", "y"], val)).toEqual(true);
      return { z: val.z + 10 };
    };
    expect(values.length).toEqual(1);
    expect(state.proxy.x.y.z).toEqual(20);
    expect(state.data.x.y.z).toEqual(20);
    state.executeCollected();
    expect(values.length).toEqual(2);
    expect(typeof state.$$$[state.proxyProperty]).toEqual("object");
    expect(typeof state.$$$.x[state.proxyProperty]).toEqual("object");
    expect(typeof state.$$$.x.y[state.proxyProperty]).toEqual("object");
    //console.log(state.data);
    expect(state.data.x.y.z).toEqual(20);
    expect(state.proxy.x.y.z).toEqual(20);
  });

  it("should notify neighbor", () => {
    const state = new State({ root: { left: { l: "l" }, right: { r: "r" } } }, options);
    const values = [];
    state.subscribe("root.left.l", (val) => {
      values.push(val);
    });

    state.subscribe("root.right.r", (val) => {
      values.push(val);
    });

    expect(values[0]).toEqual("l");
    expect(values[1]).toEqual("r");

    state.update("root.left", (left) => {
      //console.log(state.getParent(["root", "right"], state.get("root.right"))[state.proxyProperty]);
      state.update("root.right.r", (r) => {
        //console.log(state.getParent(["root", "right"], state.get("root.right"))[state.proxyProperty]);
        return "rr";
      });
      return { l: "ll" };
    });
    expect(values[2]).toEqual("rr");
    expect(values[3]).toEqual("ll");
  });

  it("should not notify child nodes", () => {
    const state = new State({ root: { left: { l: "l" }, right: { r: "r" } } }, options);
    const values = [];
    state.subscribe("root", (val) => {
      values.push("x");
    });

    expect(values[0]).toEqual("x");

    state.update("root", (root) => {
      root.left.l = "ll";
      expect(state.isSaving(["root", "right", "r"], root.right.r)).toEqual(true);
      state.update("root.right.r", (r) => {
        //console.log(root[state.proxyProperty].parent[state.proxyProperty]);
        expect(state.isSaving(["root", "right", "r"], root.right.r)).toEqual(true);
        return "rr";
      });
      return "root";
    });
    expect(values.length).toEqual(2);
  });

  it("should not notify child nodes (by proxy)", () => {
    const state = new State({ root: { left: { l: "l" }, right: { r: "r" } } }, options);
    const values = [];
    state.subscribe("root", (val) => {
      values.push("x");
    });

    expect(values[0]).toEqual("x");

    state.proxy.root = (root) => {
      //console.log(root);
      root.left.l = "ll";
      expect(state.isSaving(["root", "right", "r"], root.right.r)).toEqual(true);
      state.proxy.root.right.r = (r) => {
        //console.log(root[state.proxyProperty].parent[state.proxyProperty]);
        expect(state.isSaving(["root", "right", "r"], root.right.r)).toEqual(true);
        return "rr";
      };
      return "root";
    };
    expect(values.length).toEqual(2);
  });

  it("should react to changes on objects from get fn", () => {
    const state = new State({ root: { left: { l: "l" }, right: { r: "r" } } }, options);
    const values = [];
    state.subscribe("root.right.r", (r) => {
      values.push(r);
    });

    expect(values[0]).toEqual("r");
    const root = state.get("root");
    root.right.r = "rr";
    expect(values[1]).toEqual("rr");
  });

  it("should notify children when parent proxy node is changed", () => {
    const state = new State({ root: { left: { l: "l" } } }, options);
    const values = [];
    state.subscribe("root.left.l", (l) => {
      values.push(l);
    });
    expect(values[0]).toEqual("l");
    let root = state.get("root");
    root.left = { l: "ll" };
    expect(values[1]).toEqual("ll");

    state.proxy.root = { left: { l: "lll" } };
    expect(values[2]).toEqual("lll");
  });

  it("should update root node", () => {
    const state = new State({ x: { y: { z: 1 } } }, options);
    const values = [];
    state.subscribe("x.y.z", (val) => {
      values.push(val);
    });
    expect(values[0]).toEqual(1);
    state.update("", (oldValue) => {
      return { x: oldValue.x, xx: { yy: { zz: 1 } } };
    });
    expect(state.data[undefined]).toBeFalsy();
    expect(state.get("x.y.z")).toEqual(1);
    expect(state.get("xx.yy.zz")).toEqual(1);
  });

  it("should save function", () => {
    const values = [];
    const state = new State(
      {
        x: { y: { z: 1 } },
        fn: () => {
          values.push("fn");
        },
      },
      options
    );
    expect(values.length).toEqual(0);
    const fn = state.get("fn");
    expect(typeof fn).toEqual("function");
    fn();
    expect(values[0]).toEqual("fn");
    state.update("fff", () => {
      return () => {
        values.push("fff");
      };
    });
    expect(values.length).toEqual(1);
  });
});
