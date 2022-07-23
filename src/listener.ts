import DeepStateObserver from ".";

class DeepStateListener {
  state: DeepStateObserver;
  name: string;
  id: number;

  constructor(state: DeepStateObserver, name: string) {
    this.state = state;
    this.id = state.lastListenerId++;
    this.name = name;
    this.state.addListener(this);
  }

  destroy() {
    this.state.destroyListener(this);
  }
}

export default DeepStateListener;
