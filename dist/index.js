const WATCHER_TYPE = "watcher";














const COMPUTATION_TYPE = "computation";











const UPDATER_TYPE = "updater";









class DeepStateListener {
  
  
  
  
  
  
  

  constructor(state, name) {
    this.state = state;
    this.id = state.createListenerId();
    this.name = name;
    this.watchers = [];
    this.computations = [];
    this.updaters = [];
    this.active = true;
    this.state.addListener(this);
  }

  isActive() {
    return this.active;
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  watch(path, compareCallback) {
    this.watchers.push({ type: WATCHER_TYPE, path, callback: compareCallback });
  }

  getWatchers() {
    return this.watchers;
  }

  compute(computeCallback) {
    this.computations.push({ type: COMPUTATION_TYPE, callback: computeCallback });
  }

  getComputations() {
    return this.computations;
  }

  update(path, updateCallback) {
    this.updaters.push({ type: UPDATER_TYPE, path, callback: updateCallback });
  }

  getUpdaters() {
    return this.updaters;
  }

  destroy() {
    this.active = false;
    this.state.destroyListener(this);
  }
}

class DeepStateObserverCore {
  
  
  

  constructor(data = {}) {
    this.lastListenerId = 0;
    this.listenersById = {};
    this.data = data;
  }

  getData() {
    return this.data;
  }

  createListener(listenerName) {
    return new DeepStateListener(this, listenerName);
  }

  addListener(listener) {
    if (!this.listenersById[listener.id]) {
      this.listenersById[listener.id] = listener;
    }
  }

  createListenerId() {
    return this.lastListenerId++;
  }

  getListeners() {
    return this.listenersById;
  }

  getListener(listenerId) {
    return this.listenersById[listenerId];
  }

  destroyListener(listener) {
    listener.deactivate();
    delete this.listenersById[listener.id];
  }

  destroy() {
    this.listenersById = {};
  }
}

class DeepStateObserver {
  

  constructor(data = {}) {
    this.core = new DeepStateObserverCore(data);
  }

  createDataListener(listenerName) {
    return this.core.createListener(listenerName);
  }

  getCore() {
    return this.core;
  }

  destroy() {
    return this.core.destroy();
  }
}

export { COMPUTATION_TYPE, DeepStateListener, DeepStateObserver, DeepStateObserverCore, UPDATER_TYPE, WATCHER_TYPE, DeepStateObserver as default };
//# sourceMappingURL=index.js.map
