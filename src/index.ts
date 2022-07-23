import DeepStateListener from "./listener";

export interface ListenersById {
  [key: number]: DeepStateListener;
}

class DeepStateObserver {
  lastListenerId: number;
  private listenersById: ListenersById;
  private listeners: DeepStateListener[];

  constructor() {
    this.lastListenerId = 0;
    this.listenersById = {};
    this.listeners = [];
  }

  createListener(listenerName: string) {
    return new DeepStateListener(this, listenerName);
  }

  addListener(listener: DeepStateListener) {
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

  destroyListener(listener: DeepStateListener) {
    delete this.listenersById[listener.id];
    this.listeners = this.listeners.filter((current) => current !== listener);
  }

  destroy() {
    this.listenersById = {};
    this.listeners = [];
  }
}

export default DeepStateObserver;
export { DeepStateObserver, DeepStateListener };
