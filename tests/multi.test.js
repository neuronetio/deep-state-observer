import State from "../index.esm.js";

describe("Multi", () => {
  it("should fire couple of updates without notify and at the end of all should notify all", () => {
    const state = new State({ test1: 1, test2: 2 });
    const values = [];
    state.subscribe("test1", (value) => {
      values.push(value);
    });
    state.subscribe("test2", (value) => {
      values.push(value);
    });
    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(2);
    const multi = state
      .multi()
      .update("test1", 11)
      .update("test2", (current) => {
        //console.log(current);
        expect(values.length).toEqual(2);
        return current + 20;
      });
    //console.log(multi.getStack());
    multi.done();
    expect(values.length).toEqual(4);
    //console.log(values);
    expect(values[3]).toEqual(22);
  });

  it("should fire couple of updates without notify and at the end of all should notify only one grouped", () => {
    const state = new State({ test1: 1, test2: 2 });
    const values = [];
    let group = 0;
    state.subscribe("test1", (value) => {
      values.push(value);
    });
    state.subscribe("test2", (value) => {
      values.push(value);
    });
    state.subscribeAll(
      ["test1", "test2"],
      () => {
        group++;
      },
      { group: true }
    );
    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(2);
    expect(group).toEqual(1);
    const multi = state
      .multi(true)
      .update("test1", 11)
      .update("test2", (current) => {
        expect(values.length).toEqual(2);
        return current + 20;
      });

    multi.done();
    expect(values.length).toEqual(4);
    expect(values[3]).toEqual(22);
    expect(group).toEqual(2);
  });

  it("should fire couple of updates without notify and at the end of all should notify only one grouped", () => {
    const state = new State({ test1: 1, test2: 2, x: { y: { z: 1 } } });
    const values = [];
    let group = 0;
    state.subscribe("test1", (value) => {
      values.push(value);
    });
    state.subscribe("test2", (value) => {
      values.push(value);
    });
    state.subscribeAll(
      ["test1", "test2", "x.*.z"],
      () => {
        group++;
      },
      { group: true }
    );
    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(2);
    expect(group).toEqual(1);
    const multi = state
      .multi(true)
      .update("test1", 11)
      .update("test2", (current) => {
        expect(values.length).toEqual(2);
        return current + 20;
      })
      .update("x.y.z", 2);

    multi.done();
    expect(values.length).toEqual(4);
    expect(values[3]).toEqual(22);
    expect(group).toEqual(2);
    expect(state.get("x.y.z")).toEqual(2);
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

    let multi = state.multi();
    multi.update("test", 2);
    multi.done();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    expect(state.get("test")).toEqual(2);

    state.unmute(muted);
    let multi2 = state.multi();
    multi2.update("test", 3);
    multi2.done();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
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

    let multi = state.multi(true);
    multi.update("test", 2);
    multi.done();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    expect(state.get("test")).toEqual(2);

    state.unmute(muted);

    let multi2 = state.multi(true);
    multi2.update("test", 3);
    multi2.done();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
  });

  it("should not fire muted listeners", () => {
    const state = new State({ test: 1 });
    const values = [];
    function muted() {
      values.push(state.get("test"));
    }
    state.subscribeAll(["test"], muted, { group: true });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.mute(muted);

    let multi = state.multi();
    multi.update("test", 2);
    multi.done();

    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);
    expect(state.get("test")).toEqual(2);

    state.unmute(muted);
    let multi2 = state.multi();
    multi2.update("test", 3);
    multi2.done();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);
  });

  it("should not fire muted listeners", () => {
    const state = new State({ test: 1, x: { y: { z: 1 } } });
    const values = [];

    function muted() {
      values.push(state.get("test"));
    }

    state.subscribeAll(["test", "x.y.z"], muted, { group: true });
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.mute(muted);

    let multi = state.multi(true);
    multi.update("test", 2);
    multi.done();

    expect(state.get("test")).toEqual(2);
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.multi(true).update("x.y", { z: 2 }).done();
    state.multi(true).update("x.y.z", 222).done();

    expect(state.get("x.y.z")).toEqual(222);
    expect(values.length).toEqual(1);
    expect(values[0]).toEqual(1);

    state.unmute(muted);

    let multi2 = state.multi(true);
    multi2.update("test", 3);
    multi2.done();

    expect(values.length).toEqual(2);
    expect(values[1]).toEqual(3);

    state.multi(true).update("x.y", { z: 3 }).done();
    state.multi(true).update("x.y.z", 333).done();

    expect(values.length).toEqual(4);
    expect(state.get("x.y.z")).toEqual(333);
  });
});
