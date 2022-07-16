import State from "../index.esm.js";

describe("Group", () => {
  it("it should fire once grouped listeners at update", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    state.subscribeAll(
      ["n-1.n-1-1.id", "n-1.n-1-2.val"],
      (bulk, eventInfo) => {
        results.push(eventInfo.path);
      },
      {
        group: "test-group",
      }
    );
    expect(results.length).toEqual(1);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(2);
  });

  it("it should fire once grouped listeners and respect other subscribeAll options", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    function fn(bulk, eventInfo) {
      results.push(eventInfo.path);
    }
    state.subscribeAll(["n-1.n-1-1.id", "n-1.n-1-2.val"], fn, {
      group: "testing",
    });
    state.subscribeAll(["n-1"], fn);
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(5);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(8);
  });

  it("it should fire once grouped listeners (bulk)", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    state.subscribeAll(
      ["n-1.*.id", "n-1.*.val"],
      (bulk, eventInfo) => {
        results.push(eventInfo.path);
      },
      {
        bulk: true,
        group: "testing",
      }
    );
    expect(results.length).toEqual(1);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(2);
  });

  it("it should fire once grouped listeners and respect other subscribeAll options (bulk)", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    function fn(bulk, eventInfo) {
      results.push(eventInfo.path);
    }
    state.subscribeAll(["n-1", "n-1.*.id"], fn, {
      bulk: true,
    });
    state.subscribeAll(["n-1"], fn);
    expect(results.length).toEqual(3);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(7);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(11);
  });

  it("it should fire once grouped listeners and respect other subscribeAll options (bulk group)", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    function fn(bulk, eventInfo) {
      results.push(eventInfo.path);
    }
    state.subscribeAll(["n-1", "n-1.*.id"], fn, {
      group: "testing",
      bulk: true,
    });
    state.subscribeAll(["n-1"], fn);
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(5);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(8);
  });

  it("it should fire once grouped listeners and respect other subscribeAll options (bulk)", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    function fn(bulk, eventInfo) {
      results.push(eventInfo.path);
    }
    state.subscribeAll(["n-1", "n-1.*.id"], fn, {
      group: "testing",
    });
    state.subscribeAll(["n-1"], fn);
    // 2 because group is automatically bulk
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(5);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(8);
  });

  it("it should fire grouped listeners (mixed subscribeAll && subscribe)", () => {
    const state = new State({
      "n-1": {
        "n-1-1": {
          id: "1-1",
          val: "v1-1",
        },
        "n-1-2": {
          id: "1-2",
          val: "v1-2",
        },
      },
    });
    const results = [];
    function fn(bulk, eventInfo) {
      results.push(eventInfo.path);
    }
    state.subscribeAll(["n-1", "n-1.*.id"], fn, {
      group: "testing",
    });
    state.subscribe("n-1.n-1-1", fn, { group: "testing" });
    state.subscribe("n-1.n-1-1", fn, { group: "testing" });
    state.subscribe("n-1.n-1-2", fn, { group: "testing" });
    state.subscribeAll(["n-1", "n-1.n-1-2"], fn, { group: "testing" });
    expect(results.length).toEqual(1);
    state.update("n-1.n-1-1.id", 99);
    expect(results.length).toEqual(2);
    expect(results[1].listener).toEqual("n-1");
  });
});
