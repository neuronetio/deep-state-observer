const State = require("../index.cjs.js");
const path = require("path");
const fs = require("fs");

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
    state.subscribeAll(["n-1.*.id", "n-1.*.val"], fn, {
      group: true,
      bulk: true,
    });
    state.subscribeAll(["n-1"], fn);
    expect(results.length).toEqual(2);
    state.update("n-1.*.id", "new id");
    expect(results.length).toEqual(4);
    state.update("n-1.*.id", "new id 2");
    expect(results.length).toEqual(6);
  });
});
