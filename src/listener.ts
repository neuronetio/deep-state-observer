import DeepStateObserverCore from "./core";

export type WatchCompareCallback = () => boolean;

export type WatcherType = "watcher";
export const WATCHER_TYPE = "watcher";

export interface Watcher {
  type: WatcherType;
  path: string;
  callback: WatchCompareCallback;
}

export type Watchers = Watcher[];

export type WatchCallbacks = WatchCompareCallback[];

export type ComputeCallback = () => boolean;

export type ComputationType = "computation";
export const COMPUTATION_TYPE = "computation";

export interface Computation {
  type: ComputationType;
  callback: ComputeCallback;
}

export type Computations = Computation[];

export type UpdateCallback = () => boolean;

export type UpdaterType = "updater";
export const UPDATER_TYPE = "updater";

export interface Updater {
  type: UpdaterType;
  path: string;
  callback: UpdateCallback;
}

export type Updaters = Updater[];

class DeepStateListener {
  readonly state: DeepStateObserverCore;
  readonly name: string;
  readonly id: number;
  private readonly watchers: Watchers;
  private readonly computations: Computations;
  private readonly updaters: Updaters;
  private active: boolean;

  constructor(state: DeepStateObserverCore, name: string) {
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

  watch(path: string, compareCallback: WatchCompareCallback) {
    this.watchers.push({ type: WATCHER_TYPE, path, callback: compareCallback });
  }

  getWatchers() {
    return this.watchers;
  }

  compute(computeCallback: ComputeCallback) {
    this.computations.push({ type: COMPUTATION_TYPE, callback: computeCallback });
  }

  getComputations() {
    return this.computations;
  }

  update(path: string, updateCallback: UpdateCallback) {
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

export default DeepStateListener;
