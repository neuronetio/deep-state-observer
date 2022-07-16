import State from "../index.esm.js";

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

    const multi1 = state.multi(true);
    multi1.update("x.y.z.a.b", "bb").update("c.d.e", "ee");
    multi1.done();
    const multi2 = state.multi(true);
    multi2.update("x.y.z.a.b", "bbb");
    multi2.done();
    //console.log(state.getCollectedStack().slice());
    //console.log(multi1 === multi2, multi2.getStack(), multi1.getStack());

    expect(values.length).toEqual(2);
    state.executeCollected(); // not executed yet because of two collect methods

    expect(values.length).toEqual(2);
    state.executeCollected(); // now you can execute
    //console.log(values);
    expect(values.length).toEqual(5);
    expect(values[2]).toEqual("bbb");
    expect(values[3]).toEqual("all");
    expect(values[2]).toEqual("bbb");
  });

  it("should not fire muted listeners", () => {
    const state = new State({ test: 1 });
    const values = [];
    function muted() {
      values.push(state.get("test"));
    }
    state.subscribe("test", muted);
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.mute(muted);
    state.collect();
    state.update("test", 2);
    state.executeCollected();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.unmute(muted);

    state.collect();
    state.update("test", 3);
    state.executeCollected();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
    expect(state.get("test")).toEqual(3);
  });

  it("should not fire muted listeners (group)", () => {
    const state = new State({ test: 1 });
    const values = [];
    function muted() {
      values.push(state.get("test"));
    }
    state.subscribeAll(["test"], muted, { group: true });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.mute(muted);

    state.collect();
    state.update("test", 2);
    state.executeCollected();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    expect(state.get("test")).toEqual(2);

    state.unmute(muted);

    state.collect();
    state.update("test", 3);
    state.executeCollected();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
    expect(state.get("test")).toEqual(3);
  });

  it("should not fire muted listeners (multi & group)", () => {
    const state = new State({ test: 1 });
    const values = [];
    function muted() {
      values.push(state.get("test"));
    }
    state.subscribeAll(["test"], muted, { group: true });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.mute(muted);

    state.collect();
    state.multi().update("test", 2).done();
    state.executeCollected();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    expect(state.get("test")).toEqual(2);

    state.unmute(muted);

    state.collect();
    state.multi().update("test", 3).done();
    state.executeCollected();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
    expect(state.get("test")).toEqual(3);
  });

  it("should not fire muted listeners (multi & group 2)", () => {
    const state = new State({ test: 1 });
    const values = [];
    function muted() {
      values.push(state.get("test"));
    }
    state.subscribeAll(["test"], muted, { group: true });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.mute(muted);

    state.collect();
    state.multi(true).update("test", 2).done();
    state.executeCollected();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    expect(state.get("test")).toEqual(2);

    state.unmute(muted);

    state.collect();
    state.multi(true).update("test", 3).done();
    expect(values.length).toEqual(1);
    state.executeCollected();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
    expect(state.get("test")).toEqual(3);
  });
});
