import DeepStateObserver from ".";

class DeepStateListener {
  state: DeepStateObserver;
  name: string;

  constructor(state: DeepStateObserver, name: string) {
    this.state = state;
    this.name = name;
    this.state.addListener(this);
  }

  destroy() {
    this.state.destroyListener(this);
  }
}

export default DeepStateListener;
