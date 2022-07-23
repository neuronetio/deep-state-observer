import {
  DeepStateObserverCore,
  DeepStateObserver,
  DeepStateListener,
  WATCHER_TYPE,
  COMPUTATION_TYPE,
  UPDATER_TYPE,
} from "../dist/index.js";

describe("create / destroy", () => {
  it("should create and destroy listener by calling state", () => {
    const state = new DeepStateObserverCore({ test: 1 });
    expect(state.getData()).toEqual({ test: 1 });
    const listener = state.createListener("test-listener");
    expect(listener instanceof DeepStateListener).toBe(true);
    expect(listener.name).toEqual("test-listener");
    expect(typeof listener.id).toEqual("number");
    expect(listener.state).toBe(state);
    expect(state.getListeners()).toEqual({ [listener.id]: listener });
    state.destroyListener(listener);
    expect(state.getListeners()).toEqual({});
  });

  it("should create and destroy listener by calling listener", () => {
    const state = new DeepStateObserverCore({ test: 1 });
    expect(state.getListeners()).toEqual({});
    const listener = new DeepStateListener(state, "test-listener");
    expect(listener instanceof DeepStateListener).toBe(true);
    expect(state.getListeners()).toEqual({ [listener.id]: listener });
    listener.destroy();
    expect(state.getListeners()).toEqual({});
  });

  it("should destroy all listeners", () => {
    const state = new DeepStateObserverCore({ test: 1 });
    expect(state.getListeners()).toEqual({});
    const listener = state.createListener("test-listener");
    expect(listener instanceof DeepStateListener).toBe(true);
    expect(listener.name).toEqual("test-listener");
    expect(typeof listener.id).toEqual("number");
    expect(listener.state).toBe(state);
    expect(state.getListeners()).toEqual({ [listener.id]: listener });
    state.destroy();
    expect(state.getListeners()).toEqual({});
  });

  it("should create core by mediator", () => {
    const state = new DeepStateObserver({ test: 1 });
    expect(state.getCore().getListeners()).toEqual({});
    const listener = state.createDataListener("test-listener");
    expect(listener instanceof DeepStateListener).toBe(true);
    expect(listener.name).toEqual("test-listener");
    expect(typeof listener.id).toEqual("number");
    expect(listener.state).toBe(state.getCore());
    expect(state.getCore().getListeners()).toEqual({ [listener.id]: listener });
    state.destroy();
    expect(state.getCore().getListeners()).toEqual({});
  });

  it("should activate and deactivate data listener", () => {
    const state = new DeepStateObserver({ test: 1 });
    const listener = state.createDataListener("test");
    expect(listener.isActive()).toBe(true);
    listener.deactivate();
    expect(listener.isActive()).toBe(false);
    listener.activate();
    expect(listener.isActive()).toBe(true);
    listener.deactivate();
    expect(listener.isActive()).toBe(false);
  });

  it("should create listener watchers", () => {
    const state = new DeepStateObserver({ test: 1 });
    const listener = state.createDataListener("test");
    expect(listener.getWatchers().length).toEqual(0);
    function watchCallback1() {
      return true;
    }
    listener.watch("test", watchCallback1);
    expect(listener.getWatchers().length).toEqual(1);
    function watchCallback2() {
      return true;
    }
    listener.watch("test2", watchCallback2);
    expect(listener.getWatchers().length).toEqual(2);
    expect(listener.getWatchers().map((watcher) => watcher.type)).toEqual([WATCHER_TYPE, WATCHER_TYPE]);
    expect(listener.getWatchers().map((watcher) => watcher.path)).toEqual(["test", "test2"]);
    expect(listener.getWatchers().map((watcher) => watcher.callback)).toEqual([watchCallback1, watchCallback2]);
  });

  it("should create listener computations", () => {
    const state = new DeepStateObserver({ test: 1 });
    const listener = state.createDataListener("test");
    expect(listener.getComputations().length).toEqual(0);
    function compute1() {
      return true;
    }
    listener.compute(compute1);
    expect(listener.getComputations().length).toEqual(1);
    function compute2() {
      return false;
    }
    listener.compute(compute2);
    expect(listener.getComputations().length).toEqual(2);
    expect(listener.getComputations().map((computation) => computation.type)).toEqual([
      COMPUTATION_TYPE,
      COMPUTATION_TYPE,
    ]);
    expect(listener.getComputations().map((computation) => computation.callback)).toEqual([compute1, compute2]);
  });

  it("should create listener updaters", () => {
    const state = new DeepStateObserver({ test: 1 });
    const listener = state.createDataListener("test");
    expect(listener.getUpdaters().length).toEqual(0);
    function updaterCallback1() {
      return true;
    }
    listener.update("test", updaterCallback1);
    expect(listener.getUpdaters().length).toEqual(1);
    function updaterCallback2() {
      return true;
    }
    listener.update("test2", updaterCallback2);
    expect(listener.getUpdaters().length).toEqual(2);
    expect(listener.getUpdaters().map((updater) => updater.type)).toEqual([UPDATER_TYPE, UPDATER_TYPE]);
    expect(listener.getUpdaters().map((updater) => updater.path)).toEqual(["test", "test2"]);
    expect(listener.getUpdaters().map((updater) => updater.callback)).toEqual([updaterCallback1, updaterCallback2]);
  });
});
