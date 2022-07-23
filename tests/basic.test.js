import DeepStateObserver, { DeepStateListener } from "../dist/index.js";

describe("basic", () => {
  it("should create and destroy listener by calling state", () => {
    const state = new DeepStateObserver();
    expect(state.getListeners()).toEqual([]);
    const listener = state.createListener("test-listener");
    expect(listener instanceof DeepStateListener).toBe(true);
    expect(state.getListeners()).toEqual([listener]);
    state.destroyListener(listener);
    expect(state.getListeners()).toEqual([]);
  });

  it("should create and destroy listener by calling listener", () => {
    const state = new DeepStateObserver();
    expect(state.getListeners()).toEqual([]);
    const listener = new DeepStateListener(state, "test-listener");
    expect(listener instanceof DeepStateListener).toBe(true);
    expect(state.getListeners()).toEqual([listener]);
    listener.destroy();
    expect(state.getListeners()).toEqual([]);
  });
});
