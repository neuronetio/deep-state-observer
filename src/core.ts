import DeepStateListener, { WATCHER_TYPE, COMPUTATION_TYPE, UPDATER_TYPE } from "./listener";

export interface ListenersById {
  [key: number]: DeepStateListener;
}

class DeepStateObserverCore {
  private lastListenerId: number;
  private listenersById: ListenersById;
  private data: any;

  constructor(data: object = {}) {
    this.lastListenerId = 0;
    this.listenersById = {};
    this.data = data;
  }

  getData() {
    return this.data;
  }

  createListener(listenerName: string) {
    return new DeepStateListener(this, listenerName);
  }

  addListener(listener: DeepStateListener) {
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

  getListener(listenerId: number): DeepStateListener | undefined {
    return this.listenersById[listenerId];
  }

  destroyListener(listener: DeepStateListener) {
    listener.deactivate();
    delete this.listenersById[listener.id];
  }

  destroy() {
    this.listenersById = {};
  }
}

export default DeepStateObserverCore;
