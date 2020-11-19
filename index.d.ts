export interface PathInfo {
    listener: string;
    update: string | undefined;
    resolved: string | undefined;
}
export interface ListenerFunctionEventInfo {
    type: string;
    listener: Listener;
    listenersCollection: ListenersCollection;
    path: PathInfo;
    params: Params;
    options: ListenerOptions | UpdateOptions | undefined;
}
export declare type ListenerFunction = (value: any, eventInfo: ListenerFunctionEventInfo) => void;
export declare type Match = (path: string, debug?: boolean) => boolean;
export interface Options {
    delimiter?: string;
    useMute?: boolean;
    notRecursive?: string;
    param?: string;
    wildcard?: string;
    experimentalMatch?: boolean;
    queue?: boolean;
    maxSimultaneousJobs?: number;
    maxQueueRuns?: number;
    log?: (message: string, info: any) => void;
    debug?: boolean;
    extraDebug?: boolean;
    Promise?: Promise<unknown> | any;
}
export interface ListenerOptions {
    bulk?: boolean;
    debug?: boolean;
    source?: string;
    data?: any;
    queue?: boolean;
    ignore?: string[];
}
export interface UpdateOptions {
    only?: string[];
    source?: string;
    debug?: boolean;
    data?: any;
    queue?: boolean;
    force?: boolean;
}
export interface Listener {
    fn: ListenerFunction;
    options: ListenerOptions;
    id?: number;
}
export interface Queue {
    id: number;
    fn: () => void;
    originalFn: ListenerFunction;
}
export interface GroupedListener {
    listener: Listener;
    listenersCollection: ListenersCollection;
    eventInfo: ListenerFunctionEventInfo;
    value: any;
}
export interface GroupedListenerContainer {
    single: GroupedListener[];
    bulk: GroupedListener[];
}
export interface GroupedListeners {
    [path: string]: GroupedListenerContainer;
}
export declare type Updater = (value: any) => any;
export declare type ListenersObject = Map<string | number, Listener>;
export interface ListenersCollection {
    path: string;
    originalPath: string;
    listeners: ListenersObject;
    isWildcard: boolean;
    isRecursive: boolean;
    hasParams: boolean;
    paramsInfo: ParamsInfo | undefined;
    match: Match;
    count: number;
}
export declare type Listeners = Map<string, ListenersCollection>;
export interface WaitingPath {
    dirty: boolean;
    isWildcard: boolean;
    isRecursive: boolean;
    paramsInfo?: ParamsInfo;
}
export interface WaitingPaths {
    [key: string]: WaitingPath;
}
export declare type WaitingListenerFunction = (paths: WaitingPaths) => () => void;
export interface WaitingListener {
    fn: WaitingListenerFunction;
    paths: WaitingPaths;
}
export declare type WaitingListeners = Map<string[], WaitingListener>;
export interface ParamInfo {
    name: string;
    replaced: string;
    original: string;
}
export interface Parameters {
    [part: number]: ParamInfo;
}
export interface Params {
    [key: string]: any;
}
export interface ParamsInfo {
    params: Parameters;
    replaced: string;
    original: string;
}
declare class DeepState {
    private listeners;
    private waitingListeners;
    private data;
    private options;
    private id;
    private pathGet;
    private pathSet;
    private scan;
    private jobsRunning;
    private updateQueue;
    private subscribeQueue;
    private listenersIgnoreCache;
    private is_match;
    private destroyed;
    private queueRuns;
    private resolved;
    private muted;
    private mutedListeners;
    constructor(data?: {}, options?: Options);
    loadWasmMatcher(pathToWasmFile: string): Promise<void>;
    private same;
    getListeners(): Listeners;
    destroy(): void;
    private match;
    private getIndicesOf;
    private getIndicesCount;
    private cutPath;
    private trimPath;
    private split;
    private isWildcard;
    private isNotRecursive;
    private cleanNotRecursivePath;
    private hasParams;
    private getParamsInfo;
    private getParams;
    waitForAll(userPaths: string[], fn: WaitingListenerFunction): () => void;
    private executeWaitingListeners;
    subscribeAll(userPaths: string[], fn: ListenerFunction | WaitingListenerFunction, options?: ListenerOptions): () => void;
    private getCleanListenersCollection;
    private getCleanListener;
    private getListenerCollectionMatch;
    private getListenersCollection;
    subscribe(listenerPath: string, fn: ListenerFunction, options?: ListenerOptions, type?: string): () => void;
    private unsubscribe;
    private runQueuedListeners;
    private getQueueNotifyListeners;
    private shouldIgnore;
    private getSubscribedListeners;
    private notifySubscribedListeners;
    private getNestedListeners;
    private notifyNestedListeners;
    private getNotifyOnlyListeners;
    private sortAndRunQueue;
    private notifyOnly;
    private canBeNested;
    private getUpdateValues;
    private wildcardNotify;
    private wildcardUpdate;
    private runUpdateQueue;
    private updateNotify;
    private updateNotifyOnly;
    update(updatePath: string, fnOrValue: Updater | any, options?: UpdateOptions, multi?: boolean): any;
    multi(): {
        update(updatePath: string, fn: any, options?: UpdateOptions): any;
        done(): void;
    };
    get(userPath?: string | undefined): any;
    private lastExecs;
    last(callback: () => void): void;
    isMuted(pathOrListenerFunction: string | ListenerFunction): boolean;
    isMutedListener(listenerFunc: ListenerFunction): boolean;
    mute(pathOrListenerFunction: string | ListenerFunction): Set<ListenerFunction>;
    unmute(pathOrListenerFunction: string | ListenerFunction): boolean;
    private debugSubscribe;
    private debugListener;
    private debugTime;
}
export default DeepState;
