import DeepStateListener from "./listener";
declare class DeepStateObserver {
    private listeners;
    constructor();
    createListener(listenerName: string): DeepStateListener;
    getListeners(): DeepStateListener[];
    destroyListener(listener: DeepStateListener): void;
}
export default DeepStateObserver;
export { DeepStateObserver, DeepStateListener };
//# sourceMappingURL=index.d.ts.map