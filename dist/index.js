class DeepStateListener {
  
  

  constructor(state, name) {
    this.state = state;
    this.name = name;
    this.state.addListener(this);
  }

  destroy() {
    this.state.destroyListener(this);
  }
}

class DeepStateObserver {
  

  constructor() {
    this.listeners = [];
  }

  createListener(listenerName) {
    return new DeepStateListener(this, listenerName);
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  getListeners() {
    return this.listeners;
  }

  destroyListener(listener) {
    this.listeners = this.listeners.filter((current) => current !== listener);
  }
}

export { DeepStateListener, DeepStateObserver, DeepStateObserver as default };
//# sourceMappingURL=index.js.map
