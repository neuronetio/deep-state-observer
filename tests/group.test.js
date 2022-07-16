import State from "../index.esm.js";

describe("Group", () => {
  it("it should fire each not grouped listeners", () => {
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
    state.subscribeAll(["n-1.n-1-1.id", "n-1.n-1-2.val"], (bulk, eventInfo) => {
      results.push(eventInfo.path);
    });
    expect(results.length).toEqual(2);
  });

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
        group: true,
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
      group: true,
    });
    state.subscribeAll(["n-1"], fn);
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(5); // because of second subscribeAll is without bulk
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(8);
  });

  it("it should fire grouped listeners separately", () => {
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
      group: true,
    });
    state.subscribeAll(["n-1", "n-1.n-1-2"], fn, { group: true });
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(4);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(6);
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
        group: true,
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
      group: true,
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
      group: true,
    });
    state.subscribeAll(["n-1"], fn);
    // 2 because group is automatically bulk
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(5);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(8);
  });

  it("it should fire multiple times not grouped listeners (bulk)", () => {
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
      ["n-1", "n-1.*.id"],
      (bulk, eventInfo) => {
        results.push(eventInfo.path);
      },
      {
        bulk: true,
      }
    );
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(4);
  });

  it("it should fire multiple times not grouped listeners (not bulk)", () => {
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
    state.subscribeAll(["n-1", "n-1.*.id"], (bulk, eventInfo) => {
      results.push(bulk);
    });
    expect(results.length).toEqual(3);
    state.update("n-1.*.id", "new id");
    // 7 because n-1 will be fired two times because we are updating 2 nodes
    expect(results.length).toEqual(7);
  });
});
