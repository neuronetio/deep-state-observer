import State from "../index.esm.js";
import path from "path";
import fs from "fs";

describe("Bulk value", () => {
  it("should not send bulk value (subscribeAll)", () => {
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
      ["n-1.*", "n-*"],
      (bulk, eventInfo) => {
        results.push(eventInfo.path);
      },
      { bulk: true, bulkValue: false }
    );

    expect(results.length).toEqual(2);
    state.update("n-1.n-1-1.id", "new id 1");
    state.update("n-1.n-1-2.id", "new id 2");
    state.update("n-1.*.id", "new id x");
    expect(results.length).toEqual(8);
  });

  it("should not send bulk value (group)", () => {
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
      ["n-1.*", "n-*"],
      (bulk, eventInfo) => {
        results.push(eventInfo.path);
      },
      { group: true, bulkValue: false }
    );

    expect(results.length).toEqual(1);
    state.update("n-1.n-1-1.id", "new id 1");
    state.update("n-1.n-1-2.id", "new id 2");
    state.update("n-1.*.id", "new id x");
    expect(results.length).toEqual(4);
  });
});
