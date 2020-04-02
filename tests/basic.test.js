// @ts-nocheck
const { State } = require("../index.cjs.js");

describe("State", () => {
  it("should match simple wildcards", () => {
    const state = new State({});
    expect(state.match("te*t", "test")).toEqual(true);
    expect(state.match("*est", "test")).toEqual(true);
    expect(state.match("te*", "test")).toEqual(true);
    expect(state.match("*", "test")).toEqual(true);
    expect(state.match("*", "")).toEqual(true);

    expect(state.match("", "test")).toEqual(false);
    expect(state.match("xy*", "test")).toEqual(false);
    expect(state.match("*xy", "test")).toEqual(false);

    expect(state.match("one.two.three.*.five", "one.two.three.four.five")).toEqual(true);
    expect(state.match("one.two.three.*.five", "one.two.three.four")).toEqual(false);
  });

  it("should check existence of methods and data", () => {
    const state = new State({ test: "123" });
    expect(typeof state).toEqual("object");
    expect(typeof state.subscribe).toBe("function");
    expect(typeof state.subscribeAll).toBe("function");
    expect(typeof state.update).toBe("function");
    expect(typeof state.get).toBe("function");
    expect(typeof state.destroy).toBe("function");
    state.destroy();
  });

  it("should call State", () => {
    const state = new State({ a: "a", b: "b", c: { d: "d" } });
    let $d;
    state.subscribe("c.d", d => {
      $d = d;
    });
    expect($d).toEqual("d");
    state.destroy();
  });

  it("should get and set properties", () => {
    const state = new State({});
    const data = {
      one: { two: { three: { four: { five: 5 } } } }
    };
    expect(state.pathGet(["one", "two", "three", "four", "five"], data)).toEqual(5);
    state.pathSet(["one", "two", "three", "four", "five"], 55, data);
    expect(state.pathGet(["one", "two", "three", "four", "five"], data)).toEqual(55);
    expect(data.one.two.three.four.five).toEqual(55);

    const data2 = {};
    state.pathSet(["one", "two", "three"], 3, data2);
    expect(data2).toEqual({ one: { two: { three: 3 } } });

    const data3 = {};
    state.pathSet(["one"], 1, data3);
    expect(data3).toEqual({ one: 1 });

    const data4 = {};
    state.pathSet([], { one: 1 }, data4);
    expect(data4).toEqual({ one: 1 });
  });

  it("should update and watch", () => {
    const state = new State({
      test: {
        test2: 123
      }
    });
    let test2 = 0;
    let event = 0;
    state.subscribe("test.test2", value => {
      test2 = value;
      if (event === 0) {
        expect(value).toEqual(123);
      } else {
        expect(value).toEqual(100);
      }
      event++;
    });
    expect(test2).toEqual(123);
    state.update("test.test2", oldValue => {
      return 100;
    });
    expect(test2).toEqual(100);
    state.destroy();
  });

  it("should notify nested subscribers about change", () => {
    const state = new State({
      one: { two: { three: { four: "go!" } } }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.two.three.four", (value, eventInfo) => {
      values.push(value);
      paths.push(eventInfo.path.resolved);
    });
    expect(paths[0]).toEqual("one.two.three.four");
    expect(values[0]).toEqual("go!");

    state.update("one", { two: { three: { four: "modified" } } });
    expect(paths[1]).toEqual("one.two.three.four");
    expect(values[1]).toEqual("modified");
  });

  it("should watch all paths", () => {
    const state = new State({ x: 10, y: 20, z: { xyz: 50 } });
    let result = {};
    const paths = [];
    state.subscribeAll(["x", "y", "z.xyz"], (value, eventInfo) => {
      state.pathSet(eventInfo.path.resolved.split("."), value, result);
      paths.push(eventInfo.path.resolved);
    });
    expect(result).toEqual({ x: 10, y: 20, z: { xyz: 50 } });
    expect(paths).toEqual(["x", "y", "z.xyz"]);
    state.destroy();
  });

  it("should accept value instead of function inside update", () => {
    const state = new State({ x: 10, y: 20, z: { xyz: 50 } });
    expect(state.get()).toEqual({ x: 10, y: 20, z: { xyz: 50 } });
    state.update("z.xyz", "string instead of fn");
    expect(state.get("z.xyz")).toEqual("string instead of fn");
    state.destroy();
  });

  it("should match wildcards (object)", () => {
    const state = new State({
      one: {
        two: { three: { four: { five: 5 } } },
        "2": { three: { four: { five: 5, six: 6 } } }
      }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.*.three", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved); // 2
      values.push(value);
    });
    state.subscribe("one.*.*.four.*", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved); // 3
      values.push(value);
    });
    expect(paths.length).toEqual(5);
    expect(values.length).toEqual(5);
    expect(values[0]).toEqual({ four: { five: 5, six: 6 } });
    expect(values[1]).toEqual({ four: { five: 5 } });

    expect(values[2]).toEqual(5);
    expect(values[3]).toEqual(6);
    expect(values[4]).toEqual(5);

    const fullPath = "one.two.three.four.five";
    state.update(fullPath, "mod");
    expect(paths.length).toEqual(7);
    expect(values.length).toEqual(7);
    expect(values[5]).toEqual({ four: { five: "mod" } });
    expect(values[6]).toEqual("mod");
  });

  it("should match wildcards (array)", () => {
    const state = new State({
      one: [{ two: 2 }, { two: 22 }, { two: 222 }, { three: 3 }, [{ test: "x" }]]
    });
    const paths = [];
    const values = [];
    state.subscribe("one.*.two", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved); // 3
      values.push(value);
    });
    state.subscribe("one.*.*.test", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved); // 1
      values.push(value);
    });
    state.subscribe("one.*.three", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved); // 1
      values.push(value);
    });
    expect(paths.length).toEqual(5);
    expect(values.length).toEqual(5);
    expect(values[0]).toEqual(2);
    expect(values[1]).toEqual(22);
    expect(values[2]).toEqual(222);

    expect(values[3]).toEqual("x");
    expect(values[4]).toEqual(3);

    const fullPath = "one.0.two";
    state.update(fullPath, "mod");
    expect(paths.length).toEqual(6);
    expect(values.length).toEqual(6);
    expect(values[5]).toEqual("mod");
  });

  it("should watch recursively", () => {
    const state = new State({ one: { two: { three: 3 }, 2: 2 } });
    const paths = [];
    const values = [];
    state.subscribe("one", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths.length).toEqual(1);
    expect(values.length).toEqual(1);
    expect(paths[0]).toEqual("one");
    expect(values[0]).toEqual({ two: { three: 3 }, 2: 2 });

    state.update("one.two.three", 33);
    expect(paths.length).toEqual(2);
    expect(values.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.three");
    expect(values[1]).toEqual({ two: { three: 33 }, 2: 2 });
  });

  it("should watch recursively within path (subscribe)", () => {
    const state = new State({ one: { two: { three: { four: 4 } }, 2: 2 } });
    const paths = [];
    const values = [];
    state.subscribe("one.two.three", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths.length).toEqual(1);
    expect(values.length).toEqual(1);
    expect(paths[0]).toEqual("one.two.three");
    expect(values[0]).toEqual({ four: 4 });

    state.update("one.two.three", { four: 44 });
    expect(paths.length).toEqual(2);
    expect(values.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.three");
    expect(values[1]).toEqual({ four: 44 });
  });

  it("should watch recursively within path (subscribeAll)", () => {
    const state = new State({
      one: { two: { three: { four: [{ x: 1 }, { y: 2 }, { z: 3 }] } }, 2: 2 }
    });
    const paths = [];
    const values = [];
    state.subscribeAll(["one.two.three.four.0"], (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths.length).toEqual(1);
    expect(values.length).toEqual(1);
    expect(paths[0]).toEqual("one.two.three.four.0");
    expect(values[0]).toEqual({ x: 1 });

    state.update("one.two.three.four", [{ x: 2 }, { y: 2 }, { z: 3 }]);
    expect(paths.length).toEqual(2);
    expect(values.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.three.four.0");
    expect(values[1]).toEqual({ x: 2 });
  });

  it("should watch recursively within path and return final value if it is not an object/array", () => {
    const state = new State({
      one: { two: { three: { four: [{ x: 1 }, { y: 2 }, { z: 3 }] } }, 2: 2 }
    });
    const paths = [];
    const values = [];
    state.subscribeAll(["one.two.three.four.0.x"], (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths.length).toEqual(1);
    expect(values.length).toEqual(1);
    expect(paths[0]).toEqual("one.two.three.four.0.x");
    expect(values[0]).toEqual(1);

    state.update("one.two.three.four", [{ x: 2 }, { y: 2 }, { z: 3 }]);
    expect(paths.length).toEqual(2);
    expect(values.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.three.four.0.x");
    expect(values[1]).toEqual(2);
  });

  it("should watch recursively within object with numeric values", () => {
    const state = new State({
      one: {
        two: {
          1: { x: 1 },
          2: { x: 2 },
          3: { x: 3 }
        }
      }
    });
    const paths = [];
    const values = [];
    state.subscribeAll(["one.two"], (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths.length).toEqual(1);
    expect(values.length).toEqual(1);
    expect(paths[0]).toEqual("one.two");
    expect(values[0]).toEqual({
      1: { x: 1 },
      "2": { x: 2 },
      3: { x: 3 }
    });

    state.update("one.two.2.x", 22);
    expect(paths.length).toEqual(2);
    expect(values.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.2.x");
    expect(values[1]).toEqual({
      1: { x: 1 },
      "2": { x: 22 },
      3: { x: 3 }
    });
  });

  it("should match simple params", () => {
    const state = new State({
      users: { 1: { name: "john", age: 35 }, 2: { name: "alice", age: 30 } }
    });
    const paths = [];
    const values = [];
    const params = [];
    state.subscribe("users.:id.name", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
      params.push(eventInfo.params);
    });
    expect(paths.length).toEqual(2);
    expect(paths[0]).toEqual("users.1.name");
    expect(paths[1]).toEqual("users.2.name");
    expect(values[0]).toEqual("john");
    expect(values[1]).toEqual("alice");

    state.update("users.1.name", "madmax");
    expect(paths.length).toEqual(3);
    expect(paths[2]).toEqual("users.1.name");
    expect(values[2]).toEqual("madmax");
  });

  it("should match simple params and return bulk value", () => {
    const state = new State({
      users: { 1: { name: "john", age: 35 }, 2: { name: "alice", age: 30 } }
    });
    const paths = [];
    const values = [];
    const params = [];
    state.subscribe(
      "users.:id.name",
      (bulk, eventInfo) => {
        bulk.forEach(item => {
          paths.push(item.path);
          values.push(item.value);
          params.push(item.params);
        });
      },
      { bulk: true }
    );
    expect(paths.length).toEqual(2);
    expect(paths[0]).toEqual("users.1.name");
    expect(paths[1]).toEqual("users.2.name");
    expect(values[0]).toEqual("john");
    expect(values[1]).toEqual("alice");

    state.update("users.1.name", "madmax");
    expect(paths.length).toEqual(3);
    expect(paths[2]).toEqual("users.1.name");
    expect(values[2]).toEqual("madmax");
  });

  it("should update proper leaf", () => {
    const state = new State({
      config: {
        list: {
          rows: {
            1: { id: "id-1" },
            2: { id: "id-2" },
            3: { id: "id-3" }
          }
        }
      },
      internal: {
        list: {
          rows: {
            1: { id: "id-1" },
            2: { id: "id-2" },
            3: { id: "id-3" }
          }
        }
      }
    });
    const paths = [];
    const values = [];
    state.subscribe("config.list.rows", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      state.update("internal.list.rows", { ...value });
    });
    expect(paths[0]).toEqual("config.list.rows");
  });

  it("should bulk wildcarded subscribeAll", () => {
    const state = new State({
      something: [{ x: 1 }, { x: 1 }, { x: 1 }, { x: 1 }]
    });
    let count = 0;
    state.subscribeAll(
      ["something", "something.*.x"],
      bulk => {
        count++;
      },
      { bulk: true }
    );
    expect(count).toEqual(2);
    state.update("something", [...state.get("something"), { x: "added" }]);
    expect(count).toEqual(4);
  });

  it("should update values from wildcard path", () => {
    const state = new State({
      one: { two: { three: { four: { five: 5 } } } }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.*.three.four.five", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths.length).toEqual(1);
    expect(paths[0]).toEqual("one.two.three.four.five");
    expect(values[0]).toEqual(5);

    state.update("one.two.*.four.five", 55);
    expect(paths.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.three.four.five");
    expect(state.get("one.two.three.four.five")).toEqual(55);
    expect(values[1]).toEqual(55);

    state.update("one.two.*.four.five", 555);
    expect(paths[2]).toEqual("one.two.three.four.five");
    expect(values[2]).toEqual(555);
    expect(state.get("one.two.three.four.five")).toEqual(555);

    state.update("*.two.*.four.five", 5555);
    expect(paths[3]).toEqual("one.two.three.four.five");
    expect(values[3]).toEqual(5555);
    expect(state.get("one.two.three.four.five")).toEqual(5555);
  });

  it("should not listen to recursive changes", () => {
    const state = new State({
      one: { two: { three: { four: { five: 5 } } } }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.*.three;", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths[0]).toEqual("one.two.three");
    expect(values[0]).toEqual({ four: { five: 5 } });

    state.update("one.two.*.four.five", 55);
    expect(paths.length).toEqual(1);
    expect(values.length).toEqual(1);
    expect(state.get("one.two.three.four.five")).toEqual(55);

    state.update("one.two.*", { four: { five: 555 } });
    expect(paths.length).toEqual(2);
    expect(paths[1]).toEqual("one.two.three");
    expect(values[1]).toEqual({ four: { five: 555 } });
    expect(state.get("one.two.three.four.five")).toEqual(555);

    state.update("*.two.*.four.five", 5555);
    expect(paths.length).toEqual(2);
    expect(values.length).toEqual(2);
    expect(state.get("one.two.three.four.five")).toEqual(5555);
  });

  it("should update values from wildcard path (children)", () => {
    const state = new State({
      one: { two: { three: { four: { five: 5 } } } }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.*.three.four.five", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths[0]).toEqual("one.two.three.four.five");
    expect(values[0]).toEqual(5);

    state.update("one.two.*.four", { five: 55 });
    expect(paths[1]).toEqual("one.two.three.four.five");
    expect(values[1]).toEqual(55);
    expect(state.get("one.two.three.four.five")).toEqual(55);

    state.update("one.two.*.four", { five: 555 });
    expect(paths[2]).toEqual("one.two.three.four.five");
    expect(values[2]).toEqual(555);
    expect(state.get("one.two.three.four.five")).toEqual(555);

    state.update("*.two.*.four", { five: 5555 });
    expect(paths[3]).toEqual("one.two.three.four.five");
    expect(values[3]).toEqual(5555);
    expect(state.get("one.two.three.four.five")).toEqual(5555);
  });

  it("should update values from wildcard path (recursive)", () => {
    const state = new State({
      one: { two: { three: { four: { five: 5 } } } }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.two.three.four", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths[0]).toEqual("one.two.three.four");
    expect(values[0]).toEqual({ five: 5 });

    state.update("one.two.*.four.five", 55);
    expect(paths[1]).toEqual("one.two.three.four.five");
    expect(values[1]).toEqual({ five: 55 });
    expect(state.get("one.two.three.four.five")).toEqual(55);

    state.update("one.two.*.four.five", 555);
    expect(paths[2]).toEqual("one.two.three.four.five");
    expect(values[2]).toEqual({ five: 555 });
    expect(state.get("one.two.three.four.five")).toEqual(555);

    state.update("*.two.*.four.five", 5555);
    expect(paths[3]).toEqual("one.two.three.four.five");
    expect(values[3]).toEqual({ five: 5555 });
    expect(state.get("one.two.three.four.five")).toEqual(5555);
  });

  it("should update values from wildcard path (recursive & wildcard)", () => {
    const state = new State({
      one: { two: { three: { four: { five: 5 } } } }
    });
    const paths = [];
    const values = [];
    state.subscribe("one.*.three.four", (value, eventInfo) => {
      paths.push(eventInfo.path.resolved);
      values.push(value);
    });
    expect(paths[0]).toEqual("one.two.three.four");
    expect(values[0]).toEqual({ five: 5 });

    state.update("one.two.*.four.five", 55);
    expect(paths[1]).toEqual("one.two.three.four.five");
    expect(values[1]).toEqual({ five: 55 });
    expect(state.get("one.two.three.four.five")).toEqual(55);

    state.update("one.two.*.four.five", 555);
    expect(paths[2]).toEqual("one.two.three.four.five");
    expect(values[2]).toEqual({ five: 555 });
    expect(state.get("one.two.three.four.five")).toEqual(555);

    state.update("*.two.*.four.five", 5555);
    expect(paths[3]).toEqual("one.two.three.four.five");
    expect(values[3]).toEqual({ five: 5555 });
    expect(state.get("one.two.three.four.five")).toEqual(5555);
  });

  it("should notify only specified strict listeners", () => {
    const state = new State({
      one: { two: { three: 3 } }
    });
    const values = [];
    const paths = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe("one.two.three", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    expect(values.length).toEqual(2);
    state.update("one.two", { three: 33 }, { only: ["three"] });
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual(33);
    expect(paths[2]).toEqual("one.two.three");
    expect(state.get("one.two.three")).toEqual(33);
  });

  it("should notify only specified strict listeners #2", () => {
    const state = new State({
      one: { two: { three: { four: { five: 5 } } } }
    });
    const values = [];
    const paths = [];
    state.subscribe("one.two.*.four", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe("one.two.three.*.five", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    expect(values.length).toEqual(2);
    state.update(
      "one.two.three",
      function three(value) {
        value.four = { five: 55 };
        return value;
      },
      { only: ["four"] }
    );
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual({ five: 55 });
    expect(paths[2]).toEqual("one.two.three.four");
    expect(state.get("one.two.three.four.five")).toEqual(55);
  });

  it("should notify only specified strict listeners (nested)", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const paths = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe("one.two.three.four", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    expect(values.length).toEqual(2);
    state.update("one.two", { three: { four: 44 } }, { only: ["three.four"] });
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual(44);
    expect(paths[2]).toEqual("one.two.three.four");
    expect(state.get("one.two.three.four")).toEqual(44);
  });

  it("should notify only specified strict listeners (nested & wildcard)", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const paths = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe("one.two.three.four", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    expect(values.length).toEqual(2);
    state.update("one.two", { three: { four: 44 } }, { only: ["*.four"] });
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual(44);
    expect(paths[2]).toEqual("one.two.three.four");
    expect(state.get("one.two.three.four")).toEqual(44);
  });

  it("should notify only specified strict listeners (nested & wildcard 2)", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const paths = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe("one.two.*.four", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    expect(values.length).toEqual(2);
    state.update("one.two", { three: { four: 44 } }, { only: ["*.four"] });
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual(44);
    expect(paths[2]).toEqual("one.two.three.four");
    expect(state.get("one.two.three.four")).toEqual(44);
  });

  it("should notify only specified strict listeners (nested & wildcard & bulk)", () => {
    const base = {
      one: { two: { three: { four: 4 } } }
    };
    for (let i = 1; i < 10; i++) {
      base.one.two["three" + i] = { four: 4 };
    }
    const state = new State(base);
    const values = [];
    const paths = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe(
      "one.two.*.four",
      bulk => {
        values.push("bulk");
        paths.push("bulk");
      },
      { bulk: true }
    );
    expect(values.length).toEqual(2);
    state.update(
      "one.two",
      current => {
        const two = state.get("one.two");
        for (const three in two) {
          two[three] = { four: 44 };
        }
        return current;
      },
      { only: ["*.four"] }
    );
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual("bulk");
    expect(paths[2]).toEqual("bulk");
    expect(state.get("one.two.three.four")).toEqual(44);
    expect(state.get("one.two.three8.four")).toEqual(44);
  });

  it("should notify only specified strict listeners (nested & wildcard)", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const paths = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    state.subscribe("one.two.three.four", (val, eventInfo) => {
      values.push(val);
      paths.push(eventInfo.path.resolved);
    });
    expect(values.length).toEqual(2);
    state.update("one.two", { three: { four: 44 } }, { only: ["*.four"] });
    expect(paths.length).toEqual(3);
    expect(values[2]).toEqual(44);
    expect(paths[2]).toEqual("one.two.three.four");
    expect(state.get("one.two.three.four")).toEqual(44);
  });

  it("should destroy listeners", () => {
    const state = new State({ test: "x" });
    const values = [];
    const first = state.subscribe("test", test => {
      values.push(test);
    });
    const second = state.subscribe("test", test => {
      values.push(test + "2");
    });
    expect(values.length).toEqual(2);
    expect(values[0]).toEqual("x");
    expect(values[1]).toEqual("x2");
    state.update("test", "x3");
    expect(values.length).toEqual(4);
    expect(values[2]).toEqual("x3");
    expect(values[3]).toEqual("x32");
    first();
    state.update("test", "xx");
    expect(values.length).toEqual(5);
    expect(values[4]).toEqual("xx2");
    second();
    state.update("test", "xxx");
    expect(values.length).toEqual(5);
    expect(values[4]).toEqual("xx2");

    expect(state.listeners.size).toEqual(0);
  });

  it("should add valid event info path object", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const events = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      events.push(eventInfo);
    });
    state.subscribe("one.two.*.four", (val, eventInfo) => {
      values.push(val);
      events.push(eventInfo);
    });
    state.subscribe("one.two.three.four", (val, eventInfo) => {
      values.push(val);
      events.push(eventInfo);
    });
    expect(events.length).toEqual(3);
    expect(events[0].path.resolved).toEqual("one.two");
    expect(events[1].path.resolved).toEqual("one.two.three.four");
    expect(events[2].path.resolved).toEqual("one.two.three.four");

    expect(events[0].path.update).toEqual(undefined);
    expect(events[1].path.update).toEqual(undefined);
    expect(events[2].path.update).toEqual(undefined);

    expect(events[0].path.listener).toEqual("one.two");
    expect(events[1].path.listener).toEqual("one.two.*.four");
    expect(events[2].path.listener).toEqual("one.two.three.four");

    state.update("one.two.three.four", 44);
    expect(events.length).toEqual(6);
    expect(events[3].path.resolved).toEqual("one.two.three.four");
    expect(events[4].path.resolved).toEqual("one.two.three.four");
    expect(events[5].path.resolved).toEqual("one.two.three.four");

    expect(events[3].path.update).toEqual("one.two.three.four");
    expect(events[4].path.update).toEqual("one.two.three.four");
    expect(events[5].path.update).toEqual("one.two.three.four");

    expect(events[3].path.listener).toEqual("one.two");
    expect(events[4].path.listener).toEqual("one.two.*.four");
    expect(events[5].path.listener).toEqual("one.two.three.four");

    state.update("one.two.*.four", 444);
    expect(events.length).toEqual(9);
    expect(events[6].path.resolved).toEqual("one.two.three.four");
    expect(events[7].path.resolved).toEqual("one.two.three.four");
    expect(events[8].path.resolved).toEqual("one.two.three.four");

    expect(events[6].path.update).toEqual("one.two.*.four");
    expect(events[7].path.update).toEqual("one.two.*.four");
    expect(events[8].path.update).toEqual("one.two.*.four");

    expect(events[6].path.listener).toEqual("one.two");
    expect(events[7].path.listener).toEqual("one.two.*.four");
    expect(events[8].path.listener).toEqual("one.two.three.four");
  });

  it("should add valid event info type", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const events = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      events.push(eventInfo);
    });
    state.subscribe("one.two.*.four", (val, eventInfo) => {
      values.push(val);
      events.push(eventInfo);
    });
    state.subscribe("one.two.three.four", (val, eventInfo) => {
      values.push(val);
      events.push(eventInfo);
    });
    expect(events.length).toEqual(3);
    expect(events[0].type).toEqual("subscribe");
    expect(events[1].type).toEqual("subscribe");
    expect(events[2].type).toEqual("subscribe");

    state.update("one.*.three.four", 44);
    expect(events.length).toEqual(6);
    expect(events[3].type).toEqual("update");
    expect(events[4].type).toEqual("update");
    expect(events[5].type).toEqual("update");
  });

  it("should add two listeners with the same path but with different recursive option", () => {
    const state = new State({
      one: { two: { three: { four: 4 } } }
    });
    const values = [];
    const events = [];
    state.subscribe("one.two", (val, eventInfo) => {
      values.push(val);
      events.push({
        ...eventInfo,
        ...{ listenersCollection: eventInfo.listenersCollection }
      });
    });
    state.subscribe("one.two;", (val, eventInfo) => {
      values.push(val);
      events.push({
        ...eventInfo,
        ...{ listenersCollection: eventInfo.listenersCollection }
      });
    });
    expect(values.length).toEqual(2);
    expect(events[0].path.listener).toEqual("one.two");
    expect(events[1].path.listener).toEqual("one.two;");
    expect(events[0].listenersCollection.isRecursive).toEqual(true);
    expect(events[1].listenersCollection.isRecursive).toEqual(false);
    expect(events[0].listenersCollection).not.toEqual(events[1].listenersCollection);
    expect(state.listeners.get("one.two").count).toEqual(1);
    expect(state.listeners.get("one.two;").count).toEqual(1);
  });

  it("should execute listeners only when all values where changed", () => {
    const state = new State({
      first: { one: 1 },
      second: { two: 2 },
      third: { three: 3 }
    });
    const values = [];
    state.waitForAll(["first", "second", "third"], paths => {
      const value = {};
      for (const path in paths) {
        value[path] = state.get(path);
      }
      values.push(value);
    });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual({
      first: { one: 1 },
      second: { two: 2 },
      third: { three: 3 }
    });
    state.update("first.one", 11);
    expect(values.length).toEqual(1);
    expect(state.get("")).toEqual({
      first: { one: 11 },
      second: { two: 2 },
      third: { three: 3 }
    });
    state.update("second.two", 22);
    expect(values.length).toEqual(1);
    expect(state.get("")).toEqual({
      first: { one: 11 },
      second: { two: 22 },
      third: { three: 3 }
    });
    state.update("third.three", 33);
    expect(values.length).toEqual(2);
    expect(state.get("")).toEqual({
      first: { one: 11 },
      second: { two: 22 },
      third: { three: 33 }
    });
    expect(values[1]).toEqual({
      first: { one: 11 },
      second: { two: 22 },
      third: { three: 33 }
    });
  });

  it("should work with wait option", () => {
    const state = new State({ test: 1 }, { queue: true });
    const values = [];
    state.subscribe("test", value => {
      values.push(value);
    });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    state.update("test", 2);
    expect(values[1]).toEqual(2);
  });

  it("should wait until all jobs are finished", () => {
    const state = new State({ test: 1, other: "x" }, { queue: true });
    const values = [];
    state.subscribe("test", value => {
      state.update("other", "xx");
      values.push(value);
    });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    state.update("test", 2);
    expect(values[1]).toEqual(2);
    expect(state.get("other")).toEqual("x");
    setTimeout(() => {
      expect(state.get("other")).toEqual("xx");
    }, 100);
  });

  it("should wait until all jobs are finished with update:queue options", () => {
    const state = new State({ test: 1, other: "x" });
    const values = [];
    state.subscribe("test", value => {
      state.update("other", "xx", { queue: true });
      values.push(value);
    });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    state.update("test", 2);
    expect(values[1]).toEqual(2);
    expect(state.get("other")).toEqual("x");
    setTimeout(() => {
      expect(state.get("other")).toEqual("xx");
    }, 100);
  });

  it("should fire couple of udates without notify and at the end of all should notify all", () => {
    const state = new State({ test1: 1, test2: 2 });
    const values = [];
    state.subscribe("test1", value => {
      values.push(value);
    });
    state.subscribe("test2", value => {
      values.push(value);
    });
    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(2);
    state
      .multi()
      .update("test1", 11)
      .update("test2", () => {
        expect(values.length).toEqual(2);
        return 22;
      })
      .done();
    expect(values.length).toEqual(4);
    expect(values[3]).toEqual(22);
  });
});
