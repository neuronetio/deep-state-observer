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
export declare type Match = (path: string) => boolean;
export interface Options {
    delimeter: string;
    notRecursive: string;
    param: string;
    wildcard: string;
    queue: boolean;
    maxSimultaneousJobs: number;
    log: (message: string, info: any) => void;
}
export interface ListenerOptions {
    bulk: boolean;
    debug: boolean;
    source: string;
    data: any;
    queue: boolean;
}
export interface Listener {
    fn: ListenerFunction;
    options: ListenerOptions;
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
export declare type Updater = (value: any) => any | any;
export declare type ListenersObject = Map<string | number, Listener>;
export interface ListenersCollection {
    path: string;
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
export interface UpdateOptions {
    only: string[];
    source: string;
    debug: boolean;
    data: any;
    queue: boolean;
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
    constructor(data?: {}, options?: Options);
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
    private same;
    private runQueuedListeners;
    private notifyListeners;
    private getSubscribedListeners;
    private notifySubscribedListeners;
    private getNestedListeners;
    private notifyNestedListeners;
    private getNotifyOnlyListeners;
    private notifyOnly;
    private canBeNested;
    private getUpdateValues;
    private wildcardUpdate;
    private runUpdateQueue;
    update(updatePath: string, fn: Updater, options?: UpdateOptions): any;
    get(userPath?: string | undefined): any;
    private debugSubscribe;
    private debugListener;
    private debugTime;
}
export default DeepState;
export declare const State: typeof DeepState;
