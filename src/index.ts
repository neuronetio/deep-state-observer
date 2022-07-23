import DeepStateObserverCore from "./core";
import DeepStateListener from "./listener";

class DeepStateObserver {
  private core: DeepStateObserverCore;

  constructor(data: object = {}) {
    this.core = new DeepStateObserverCore(data);
  }

  createDataListener(listenerName: string) {
    return this.core.createListener(listenerName);
  }

  getCore() {
    return this.core;
  }

  destroy() {
    return this.core.destroy();
  }
}

export default DeepStateObserver;
export * from "./core";
export * from "./listener";
export { DeepStateObserverCore, DeepStateListener, DeepStateObserver };
