import DeepStateListener from "./listener";

class DeepStateObserver {
  private listeners: DeepStateListener[];

  constructor() {
    this.listeners = [];
  }

  createListener(listenerName: string) {
    return new DeepStateListener(this, listenerName);
  }

  addListener(listener: DeepStateListener) {
    this.listeners.push(listener);
  }

  getListeners() {
    return this.listeners;
  }

  destroyListener(listener: DeepStateListener) {
    this.listeners = this.listeners.filter((current) => current !== listener);
  }
}

export default DeepStateObserver;
export { DeepStateObserver, DeepStateListener };
