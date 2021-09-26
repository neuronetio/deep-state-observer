const State = require("../index.cjs.js");

describe("Collection", () => {
  it("should collect all updates", () => {
    const state = new State({
      x: { y: { z: { a: { b: "b" } } } },
      c: { d: { e: "e" } },
    });
    const values = [];
    state.subscribe("x.y.z.a.b", (val, eventInfo) => {
      values.push(val);
    });
    state.subscribeAll(
      ["x.y.*.a.b", "c.d.e"],
      (val, eventInfo) => {
        values.push("all");
      },
      { group: true }
    );
    expect(values.length).toEqual(2);
    expect(values[0]).toEqual("b");
    expect(values[1]).toEqual("all");
    state.collect();
    state.update("x.y.z.a.b", "bb");
    state.update("c.d.e", "ee");
    expect(values.length).toEqual(2);
    state.executeCollected();
    expect(values.length).toEqual(4);
    expect(values[2]).toEqual("bb");
    expect(values[3]).toEqual("all");
  });

  it("should collect all updates without group", () => {
    const state = new State({
      x: { y: { z: { a: { b: "b" } } } },
      c: { d: { e: "e" } },
    });
    const values = [];
    state.subscribe("x.y.z.a.b", (val, eventInfo) => {
      values.push(val);
    });
    state.subscribeAll(["x.y.*.a.b", "c.d.e"], (val, eventInfo) => {
      values.push(val);
    });
    expect(values.length).toEqual(3);
    expect(values[0]).toEqual("b");
    expect(values[1]).toEqual("b");
    expect(values[2]).toEqual("e");
    state.collect();
    state.update("x.y.z.a.b", "bb");
    state.update("c.d.e", "ee");
    expect(values.length).toEqual(3);
    state.executeCollected();
    expect(values.length).toEqual(6);
    expect(values[3]).toEqual("bb");
    expect(values[4]).toEqual("bb");
    expect(values[5]).toEqual("ee");
  });

  it("should execute collection at the end of all collections", () => {
    const state = new State({
      x: { y: { z: { a: { b: "b" } } } },
      c: { d: { e: "e" } },
    });
    const values = [];
    state.subscribe("x.y.z.a.b", (val, eventInfo) => {
      values.push(val);
    });
    state.subscribeAll(
      ["x.y.*.a.b", "c.d.e"],
      (val, eventInfo) => {
        values.push("all");
      },
      { group: true }
    );
    expect(values.length).toEqual(2);
    expect(values[0]).toEqual("b");
    expect(values[1]).toEqual("all");

    state.collect();
    state.collect();

    state.update("x.y.z.a.b", "bb");
    state.update("c.d.e", "ee");

    expect(values.length).toEqual(2);
    state.executeCollected(); // not executed yet because of two collect methods

    expect(values.length).toEqual(2);

    state.executeCollected(); // now you can execute
    expect(values.length).toEqual(4);
    expect(values[2]).toEqual("bb");
    expect(values[3]).toEqual("all");
  });

  it("should execute collection at the end of all collections with multi", () => {
    const state = new State({
      x: { y: { z: { a: { b: "b" } } } },
      c: { d: { e: "e" } },
    });
    const values = [];
    state.subscribe("x.y.z.a.b", (val, eventInfo) => {
      values.push(val);
    });
    state.subscribeAll(
      ["x.y.*.a.b", "c.d.e"],
      (val, eventInfo) => {
        values.push("all");
      },
      { group: true }
    );
    expect(values.length).toEqual(2);
    expect(values[0]).toEqual("b");
    expect(values[1]).toEqual("all");

    state.collect();
    state.collect();

    state.multi(true).update("x.y.z.a.b", "bb").update("c.d.e", "ee").done();

    expect(values.length).toEqual(2);
    state.executeCollected(); // not executed yet because of two collect methods

    expect(values.length).toEqual(2);

    state.executeCollected(); // now you can execute
    expect(values.length).toEqual(4);
    expect(values[2]).toEqual("bb");
    expect(values[3]).toEqual("all");
  });
});
