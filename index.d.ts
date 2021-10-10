export interface PathInfo {
    listener: string;
    update: string | undefined;
    resolved: string | undefined;
}
export interface ListenerFunctionEventInfo<T> {
    type: string;
    listener: Listener<T>;
    listenersCollection: ListenersCollection<T>;
    path: PathInfo;
    params: Params;
    options: ListenerOptions | UpdateOptions | undefined;
}
export declare type ListenerFunction<T> = (value: T, eventInfo: ListenerFunctionEventInfo<T>) => void;
export declare type Match = (path: string, debug?: boolean) => boolean;
export interface Options {
    delimiter?: string;
    useMute?: boolean;
    notRecursive?: string;
    param?: string;
    wildcard?: string;
    experimentalMatch?: boolean;
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
    ignore?: string[];
    group?: boolean;
}
export interface UpdateOptions {
    only?: string[];
    source?: string;
    debug?: boolean;
    data?: any;
    queue?: boolean;
    force?: boolean;
}
export interface Listener<T> {
    fn: ListenerFunction<T>;
    options: ListenerOptions;
    id?: number;
    groupId: number | null;
}
export interface Queue<T> {
    id: number;
    resolvedPath: string;
    resolvedIdPath: string;
    fn: () => void;
    originalFn: ListenerFunction<T>;
    options: ListenerOptions;
    groupId: number;
}
export interface GroupedListener<T> {
    listener: Listener<PathValue<T, PossiblePath<T>>>;
    listenersCollection: ListenersCollection<T>;
    eventInfo: ListenerFunctionEventInfo<T>;
    value: any;
}
export interface GroupedListenerContainer<T> {
    single: GroupedListener<T>[];
    bulk: GroupedListener<T>[];
}
export interface GroupedListeners<T> {
    [path: string]: GroupedListenerContainer<T>;
}
export declare type Updater = (value: any) => any;
export declare type ListenersObject<T> = Map<string | number, Listener<T>>;
export interface ListenersCollection<T> {
    path: string;
    originalPath: string;
    listeners: ListenersObject<PathValue<T, PossiblePath<T>>>;
    isWildcard: boolean;
    isRecursive: boolean;
    hasParams: boolean;
    paramsInfo: ParamsInfo | undefined;
    match: Match;
    count: number;
}
export declare type Listeners<T> = Map<string, ListenersCollection<T>>;
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
export interface SubscribeAllOptions {
    all: string[];
    index: number;
    groupId: number;
}
export interface TraceValue {
    id: string;
    sort: number;
    stack: string[];
    additionalData: any;
    changed: any[];
}
export interface UpdateStack {
    updatePath: string;
    newValue: unknown;
    options: UpdateOptions;
}
export interface Multi {
    update: (updatePath: string, fn: Updater | any, options?: UpdateOptions) => Multi;
    done: () => void;
    getStack: () => UpdateStack[];
}
declare type PathImpl<T, K extends keyof T> = K extends string ? T[K] extends Record<string, any> ? T[K] extends ArrayLike<any> ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}` : K | `${K}.${PathImpl<T[K], keyof T[K]>}` : K : any;
declare type PossiblePath<T> = PathImpl<T, keyof T> | keyof T | string;
declare type PathValue<T, P extends PossiblePath<T>> = P extends `${infer K}.${infer Rest}` ? K extends keyof T ? Rest extends PossiblePath<T[K]> ? PathValue<T[K], Rest> : any : any : P extends keyof T ? T[P] : any;
export interface UnknownObject {
    [key: string]: unknown;
}
declare class DeepState<T> {
    private listeners;
    private data;
    private options;
    private id;
    private pathGet;
    private pathSet;
    private scan;
    private subscribeQueue;
    private listenersIgnoreCache;
    private is_match;
    private destroyed;
    private resolved;
    private muted;
    private mutedListeners;
    private groupId;
    private traceId;
    private traceMap;
    private tracing;
    private savedTrace;
    private collection;
    private collections;
    private proxyPath;
    private proxyUpdate;
    private handler;
    proxy: T;
    /**
     * @property $$$ proxy shorthand
     */
    $$$: T;
    constructor(data?: T | object, options?: Options);
    private mergeDeepProxy;
    loadWasmMatcher(pathToWasmFile: string): Promise<void>;
    private same;
    getListeners(): Listeners<T>;
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
    subscribeAll(userPaths: string[], fn: ListenerFunction<PathValue<T, PossiblePath<T>>>, options?: ListenerOptions): () => void;
    private getCleanListenersCollection;
    private getCleanListener;
    private getListenerCollectionMatch;
    private getListenersCollection;
    subscribe<P extends PossiblePath<T>>(listenerPath: P, fn: ListenerFunction<PathValue<T, P>>, options?: ListenerOptions, subscribeAllOptions?: SubscribeAllOptions): () => void;
    private unsubscribe;
    private runQueuedListeners;
    private getQueueNotifyListeners;
    private shouldIgnore;
    private getSubscribedListeners;
    private notifySubscribedListeners;
    private getNestedListeners;
    private notifyNestedListeners;
    private getNotifyOnlyListeners;
    private runQueue;
    private sortAndRunQueue;
    private notifyOnly;
    private canBeNested;
    private getUpdateValues;
    private wildcardNotify;
    private wildcardUpdate;
    private updateNotify;
    private updateNotifyAll;
    private updateNotifyOnly;
    update(updatePath: string, fnOrValue: Updater | any, options?: UpdateOptions, multi?: boolean): any;
    multi(grouped?: boolean): Multi;
    collect(): Multi;
    executeCollected(): void;
    getCollectedCount(): number;
    getCollectedStack(): UpdateStack[];
    get<P extends PossiblePath<T>>(userPath: P | string): PathValue<T, P>;
    private lastExecs;
    last(callback: () => void): void;
    isMuted(pathOrListenerFunction: string | ListenerFunction<PathValue<T, PossiblePath<T>>>): boolean;
    isMutedListener(listenerFunc: ListenerFunction<PathValue<T, PossiblePath<T>>>): boolean;
    mute(pathOrListenerFunction: string | ListenerFunction<PathValue<T, PossiblePath<T>>>): Set<ListenerFunction<(string extends keyof T ? T[keyof T & string] : any) | PathValue<T, keyof T> | PathValue<T, PathImpl<T, keyof T>>>>;
    unmute(pathOrListenerFunction: string | ListenerFunction<PathValue<T, PossiblePath<T>>>): boolean;
    private debugSubscribe;
    private debugListener;
    private debugTime;
    startTrace(name: string, additionalData?: any): string;
    stopTrace(id: string): TraceValue;
    saveTrace(id: string): TraceValue;
    getSavedTraces(): TraceValue[];
}
export default DeepState;
