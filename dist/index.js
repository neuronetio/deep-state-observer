class DeepStateListener {
  
  
  

  constructor(state, name) {
    this.state = state;
    this.id = state.lastListenerId++;
    this.name = name;
    this.state.addListener(this);
  }

  destroy() {
    this.state.destroyListener(this);
  }
}

class DeepStateObserver {
  
  
  

  constructor() {
    this.lastListenerId = 0;
    this.listenersById = {};
    this.listeners = [];
  }

  createListener(listenerName) {
    return new DeepStateListener(this, listenerName);
  }

  addListener(listener) {
    if (!this.listenersById[listener.id]) {
      this.listenersById[listener.id] = listener;
      this.listeners.push(listener);
    }
  }

  getListeners() {
    return this.listeners;
  }

  getListenersById() {
    return this.listenersById;
  }

  destroyListener(listener) {
    delete this.listenersById[listener.id];
    this.listeners = this.listeners.filter((current) => current !== listener);
  }

  destroy() {
    this.listenersById = {};
    this.listeners = [];
  }
}

export { DeepStateListener, DeepStateObserver, DeepStateObserver as default };
//# sourceMappingURL=index.js.map
