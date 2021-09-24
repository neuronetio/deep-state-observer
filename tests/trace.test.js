const State = require("../index.cjs.js");
const path = require("path");
const fs = require("fs");

describe("Trace", () => {
  it("should trace changes", () => {
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
    const traceId = state.startTrace("test");
    state.update("n-1.n-1-1.id", "new id 1");
    state.update("n-1.n-1-2.id", "new id 2");
    state.update("n-1.*.id", "new id x");
    const traceResult = state.stopTrace(traceId);
    expect(traceResult.changed.length).toEqual(3);
  });
});
