import State from "../index.esm.js";
import path from "path";
import fs from "fs";

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

  it("should save all traces", () => {
    const state = new State({
      p1: "p1v",
      p2: "p2v",
      x1: "x1v",
      x2: "x2v",
    });
    state.subscribe("p1", () => {
      const trackId = state.startTrace("p1");
      state.update("p2", "p2v-");
      state.saveTrace(trackId);
    });
    state.subscribe("p2", () => {
      const trackId = state.startTrace("p2");
      state.update("x2", "x2v-");
      state.saveTrace(trackId);
    });
    const result = state.getSavedTraces();
    //result.forEach((trace) => console.log(trace.changed));
    expect(result.length).toEqual(2);
  });

  it("should save all traces with additional data", () => {
    const state = new State({
      p1: "p1v",
      p2: "p2v",
      x1: "x1v",
      x2: "x2v",
    });
    state.subscribe("p1", (val, eventInfo) => {
      const trackId = state.startTrace("p1", eventInfo);
      state.update("p2", "p2v-");
      state.saveTrace(trackId);
    });
    state.subscribe("p2", (val, eventInfo) => {
      const trackId = state.startTrace("p2", eventInfo);
      state.update("x2", "x2v-");
      state.saveTrace(trackId);
    });
    const result = state.getSavedTraces();
    //result.forEach((trace) => console.log(trace.changed));
    expect(result.length).toEqual(2);
    //console.log(result);
    expect(typeof result[0].additionalData.path).toEqual("object");
    expect(result[1].sort).toEqual(2);
  });
});
