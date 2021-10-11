import WildcardObject from "./wildcard-object-scan";
import Path from "./ObjectPath";
import init, { is_match } from "./wildcard_matcher.js";

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

export type ListenerFunction<T> = (value: T, eventInfo: ListenerFunctionEventInfo<T>) => void;
export type Match = (path: string, debug?: boolean) => boolean;

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

export type Updater = (value: any) => any;

export type ListenersObject<T> = Map<string | number, Listener<T>>;

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

export type Listeners<T> = Map<string, ListenersCollection<T>>;

export interface WaitingPath {
  dirty: boolean;
  isWildcard: boolean;
  isRecursive: boolean;
  paramsInfo?: ParamsInfo;
}

export interface WaitingPaths {
  [key: string]: WaitingPath;
}

export type WaitingListenerFunction = (paths: WaitingPaths) => () => void;

export interface WaitingListener {
  fn: WaitingListenerFunction;
  paths: WaitingPaths;
}

export type WaitingListeners = Map<string[], WaitingListener>;

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

export interface Bulk {
  path: string;
  value: any;
  params: Params;
}

const defaultUpdateOptions: UpdateOptions = {
  only: [],
  source: "",
  debug: false,
  data: undefined,
  force: false,
};

export interface Multi {
  update: (updatePath: string, fn: Updater | any, options?: UpdateOptions) => Multi;
  done: () => void;
  getStack: () => UpdateStack[];
}

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : any;

type PossiblePath<T> = PathImpl<T, keyof T> | keyof T | string;

type PathValue<T, P extends PossiblePath<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends PossiblePath<T[K]>
      ? PathValue<T[K], Rest>
      : any
    : any
  : P extends keyof T
  ? T[P]
  : any;

function log(message: string, info: any) {
  console.debug(message, info);
}

/**
 * Is object - helper function to determine if specified variable is an object
 *
 * @param {any} item
 * @returns {boolean}
 */
function isObject(item: unknown) {
  return item && typeof item === "object" && item !== null && item.constructor && item.constructor.name === "Object";
}

export interface UnknownObject {
  [key: string]: unknown;
}

function getDefaultOptions(): Options {
  return {
    delimiter: `.`,
    debug: false,
    extraDebug: false,
    useMute: true,
    notRecursive: `;`,
    param: `:`,
    wildcard: `*`,
    experimentalMatch: false,
    maxSimultaneousJobs: 1000,
    maxQueueRuns: 1000,
    log,
    Promise,
  };
}

const defaultListenerOptions: ListenerOptions = {
  bulk: false,
  debug: false,
  source: "",
  data: undefined,
  group: false,
};

class DeepState<T> {
  private listeners: Listeners<PathValue<T, PossiblePath<T>> | string>;
  private data: T | object;
  private options: Options;
  private id: number;
  private pathGet: any;
  private pathSet: any;
  private scan: any;
  private subscribeQueue = [];
  private listenersIgnoreCache: WeakMap<
    Listener<PathValue<T, PossiblePath<T>>>,
    { truthy: string[]; falsy: string[] }
  > = new WeakMap();
  private is_match: any;
  private destroyed = false;
  private resolved: Promise<unknown> | any;
  private muted: Set<string>;
  private mutedListeners: Set<ListenerFunction<PathValue<T, PossiblePath<T>>>>;
  private groupId: number = 0;
  private traceId: number = 0;
  private traceMap: Map<string, TraceValue> = new Map();
  private tracing: string[] = [];
  private savedTrace: TraceValue[] = [];
  private collection: Multi = null;
  private collections: number = 0;
  public silent = false;
  public readonly proxyProperty = "___deep_state_observer___";

  private handler = {
    set: (obj, prop, value, proxy) => {
      if (prop === this.proxyProperty) return true;
      if (!obj[this.proxyProperty].saving) {
        const path = obj[this.proxyProperty]
          ? obj[this.proxyProperty].path
            ? obj[this.proxyProperty].path + this.options.delimiter + prop
            : prop
          : prop;
        if (!this.silent && !this.parentIsSaving(path)) {
          this.update(path, value);
        } else {
          if (typeof value === "function") {
            value = value(this.pathGet(this.split(path), this.data));
          }
          if (isObject(value) || Array.isArray(value)) {
            value = this.makeObservable(value, path);
          }
          obj[prop] = value;
        }
      } else {
        obj[prop] = value;
      }
      return true;
    },
  };
  public proxy: T;
  /**
   * @property $$$ proxy shorthand
   */
  public $$$: T;

  constructor(data: T | object = {}, options: Options = {}) {
    this.listeners = new Map();
    this.handler.set = this.handler.set.bind(this);
    this.options = { ...getDefaultOptions(), ...options };
    this.data = this.makeObservable(data, "");
    this.proxy = this.data as T;
    this.$$$ = this.proxy;
    this.id = 0;
    this.pathGet = Path.get;
    this.pathSet = Path.set;
    if (options.Promise) {
      this.resolved = options.Promise.resolve();
    } else {
      this.resolved = Promise.resolve();
    }
    this.muted = new Set();
    this.mutedListeners = new Set();
    this.scan = new WildcardObject<T>(this.data, this.options.delimiter, this.options.wildcard);
    this.destroyed = false;
  }

  private getParent(path) {
    if (path) {
      const split = this.split(path);
      split.pop();
      if (!split.length) return this.data;
      return this.pathGet(split, this.data);
    }
  }

  private parentIsSaving(path) {
    const split = this.split(path);
    let parent = this.getParent(split.join(this.options.delimiter));
    if (parent) {
      if (parent && parent[this.proxyProperty].saving) return true;
      split.pop();
      return this.parentIsSaving(split.join(this.options.delimiter));
    }
    return false;
  }

  private setProxy(target: any, data: { path: string; saving: boolean }) {
    if (typeof target[this.proxyProperty] === "undefined") {
      Object.defineProperty(target, this.proxyProperty, {
        enumerable: false,
        value: data,
      });
      return new Proxy(target, this.handler);
    } else {
      for (const key in data) {
        target[this.proxyProperty][key] = data[key];
      }
    }
    return target;
  }

  private makeObservable(target: any, path: string) {
    if (isObject(target) || Array.isArray(target)) {
      if (isObject(target)) {
        for (const key in target) {
          if (key === this.proxyProperty) continue;
          if (isObject(target[key]) || Array.isArray(target[key])) {
            target[key] = this.makeObservable(target[key], `${path ? path + this.options.delimiter : ""}${key}`);
          }
        }
      } else {
        for (let key = 0, len = target.length; key < len; key++) {
          if (isObject(target[key]) || Array.isArray(target[key])) {
            target[key] = this.makeObservable(target[key], `${path ? path + this.options.delimiter : ""}${key}`);
          }
        }
      }
      target = this.setProxy(target, { path, saving: false });
    }
    return target;
  }

  public async loadWasmMatcher(pathToWasmFile: string) {
    await init(pathToWasmFile);
    this.is_match = is_match;
    this.scan = new WildcardObject(this.data, this.options.delimiter, this.options.wildcard, this.is_match);
  }

  private same(newValue, oldValue): boolean {
    return (
      (["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
      oldValue === newValue
    );
  }

  public getListeners(): Listeners<T> {
    return this.listeners;
  }

  public destroy() {
    this.destroyed = true;
    this.data = undefined;
    this.listeners = new Map();
  }

  private match(first: string, second: string, nested: boolean = true): boolean {
    if (this.is_match) return this.is_match(first, second);
    if (first === second) return true;
    if (first === this.options.wildcard || second === this.options.wildcard) return true;
    if (
      !nested &&
      this.getIndicesCount(this.options.delimiter, first) < this.getIndicesCount(this.options.delimiter, second)
    ) {
      // first < second because first is a listener path and may be longer but not shorter
      return false;
    }
    return this.scan.match(first, second);
  }

  private getIndicesOf(searchStr: string, str: string): number[] {
    const searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    let startIndex = 0,
      index,
      indices = [];
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  private getIndicesCount(searchStr: string, str: string): number {
    const searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return 0;
    }
    let startIndex = 0,
      index,
      indices = 0;
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices++;
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  private cutPath(longer: string, shorter: string): string {
    longer = this.cleanNotRecursivePath(longer);
    shorter = this.cleanNotRecursivePath(shorter);
    if (longer === shorter) return longer;
    const shorterPartsLen = this.getIndicesCount(this.options.delimiter, shorter);
    const longerParts = this.getIndicesOf(this.options.delimiter, longer);
    return longer.substr(0, longerParts[shorterPartsLen]);
  }

  private trimPath(path: string): string {
    path = this.cleanNotRecursivePath(path);
    if (path.charAt(0) === this.options.delimiter) {
      return path.substr(1);
    }
    return path;
  }

  private split(path: string) {
    return path === "" ? [] : path.split(this.options.delimiter);
  }

  private isWildcard(path: string): boolean {
    return path.includes(this.options.wildcard) || this.hasParams(path);
  }

  private isNotRecursive(path: string): boolean {
    return path.endsWith(this.options.notRecursive);
  }

  private cleanNotRecursivePath(path: string): string {
    return this.isNotRecursive(path) ? path.substring(0, path.length - 1) : path;
  }

  private hasParams(path: string) {
    return path.includes(this.options.param);
  }

  private getParamsInfo(path: string): ParamsInfo {
    let paramsInfo: ParamsInfo = { replaced: "", original: path, params: {} };
    let partIndex = 0;
    let fullReplaced = [];
    for (const part of this.split(path)) {
      paramsInfo.params[partIndex] = {
        original: part,
        replaced: "",
        name: "",
      };
      const reg = new RegExp(`\\${this.options.param}([^\\${this.options.delimiter}\\${this.options.param}]+)`, "g");
      let param = reg.exec(part);
      if (param) {
        paramsInfo.params[partIndex].name = param[1];
      } else {
        delete paramsInfo.params[partIndex];
        fullReplaced.push(part);
        partIndex++;
        continue;
      }
      reg.lastIndex = 0;
      paramsInfo.params[partIndex].replaced = part.replace(reg, this.options.wildcard);
      fullReplaced.push(paramsInfo.params[partIndex].replaced);
      partIndex++;
    }
    paramsInfo.replaced = fullReplaced.join(this.options.delimiter);
    return paramsInfo;
  }

  private getParams(paramsInfo: ParamsInfo | undefined, path: string): Params {
    if (!paramsInfo) {
      return undefined;
    }
    const split = this.split(path);
    const result = {};
    for (const partIndex in paramsInfo.params) {
      const param = paramsInfo.params[partIndex];
      result[param.name] = split[partIndex];
    }
    return result;
  }

  public subscribeAll(
    userPaths: string[],
    fn: ListenerFunction<PathValue<T, PossiblePath<T>>>,
    options: ListenerOptions = defaultListenerOptions
  ) {
    if (this.destroyed) return () => {};
    let unsubscribers = [];
    let index = 0;
    if (options.group) {
      this.groupId++;
      options.bulk = true;
    }
    for (const userPath of userPaths) {
      unsubscribers.push(
        this.subscribe(userPath as never, fn, options, {
          all: userPaths,
          index,
          groupId: options.group ? this.groupId : null,
        })
      );
      index++;
    }
    return function unsubscribe() {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }

  private getCleanListenersCollection(values = {}): ListenersCollection<T> {
    return {
      listeners: new Map(),
      isRecursive: false,
      isWildcard: false,
      hasParams: false,
      match: undefined,
      paramsInfo: undefined,
      path: undefined,
      originalPath: undefined,
      count: 0,
      ...values,
    };
  }

  private getCleanListener(
    fn: ListenerFunction<PathValue<T, PossiblePath<T>>>,
    options: ListenerOptions = defaultListenerOptions
  ): Listener<PathValue<T, PossiblePath<T>>> {
    return {
      fn,
      options: { ...defaultListenerOptions, ...options },
      groupId: null,
    };
  }

  private getListenerCollectionMatch(listenerPath: string, isRecursive: boolean, isWildcard: boolean) {
    listenerPath = this.cleanNotRecursivePath(listenerPath);
    const self = this;
    return function listenerCollectionMatch(path, debug = false) {
      let scopedListenerPath = listenerPath;
      if (isRecursive) {
        path = self.cutPath(path, listenerPath);
      } else {
        scopedListenerPath = self.cutPath(self.cleanNotRecursivePath(listenerPath), path);
      }
      if (debug) {
        console.log("[getListenerCollectionMatch]", {
          listenerPath,
          scopedListenerPath,
          path,
          isRecursive,
          isWildcard,
        });
      }
      if (isWildcard && self.match(scopedListenerPath, path, isRecursive)) return true;
      return scopedListenerPath === path;
    };
  }

  private getListenersCollection(
    listenerPath: string,
    listener: Listener<PathValue<T, PossiblePath<T>>>
  ): ListenersCollection<PathValue<T, PossiblePath<T>>> {
    if (this.listeners.has(listenerPath)) {
      let listenersCollection = this.listeners.get(listenerPath);
      listenersCollection.listeners.set(++this.id, listener);
      listener.id = this.id;
      return listenersCollection;
    }
    const hasParams = this.hasParams(listenerPath);
    let paramsInfo;
    if (hasParams) {
      paramsInfo = this.getParamsInfo(listenerPath);
    }
    let collCfg = {
      isRecursive: !this.isNotRecursive(listenerPath),
      isWildcard: this.isWildcard(listenerPath),
      hasParams,
      paramsInfo,
      originalPath: listenerPath,
      path: hasParams ? paramsInfo.replaced : listenerPath,
    };
    if (!collCfg.isRecursive) {
      collCfg.path = this.cleanNotRecursivePath(collCfg.path);
    }
    let listenersCollection = this.getCleanListenersCollection({
      ...collCfg,
      match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard),
    });
    this.id++;
    listenersCollection.listeners.set(this.id, listener);
    listener.id = this.id;
    this.listeners.set(collCfg.originalPath, listenersCollection);
    return listenersCollection;
  }

  public subscribe<P extends PossiblePath<T>>(
    listenerPath: P,
    fn: ListenerFunction<PathValue<T, P>>,
    options: ListenerOptions = defaultListenerOptions,
    subscribeAllOptions: SubscribeAllOptions = {
      all: [listenerPath as string],
      index: 0,
      groupId: this.groupId,
    }
  ) {
    if (this.destroyed) return () => {};
    const type = "subscribe";
    let listener = this.getCleanListener(fn, options);
    if (options.group) listener.groupId = subscribeAllOptions.groupId;
    this.listenersIgnoreCache.set(listener, { truthy: [], falsy: [] });
    const listenersCollection = this.getListenersCollection(listenerPath as string, listener);
    if (options.debug) {
      console.log();
    }
    listenersCollection.count++;
    if (!options.group || (options.group && subscribeAllOptions.all.length - 1 === subscribeAllOptions.index)) {
      const cleanPath = this.cleanNotRecursivePath(listenersCollection.path);
      if (!listenersCollection.isWildcard) {
        if (!this.isMuted(cleanPath) && !this.isMuted(fn)) {
          fn(this.pathGet(this.split(cleanPath), this.data), {
            type,
            listener,
            listenersCollection,
            path: {
              listener: listenerPath as string,
              update: undefined,
              resolved: this.cleanNotRecursivePath(listenerPath as string),
            },
            params: this.getParams(listenersCollection.paramsInfo, cleanPath),
            options,
          });
        }
      } else {
        const paths = this.scan.get(cleanPath);
        const bulkValue: Bulk[] = [];
        for (const path in paths) {
          if (this.isMuted(path)) continue;
          bulkValue.push({
            path,
            params: this.getParams(listenersCollection.paramsInfo, path),
            value: paths[path],
          });
        }
        if (options.bulk) {
          if (!this.isMuted(fn)) {
            fn(bulkValue, {
              type,
              listener,
              listenersCollection,
              path: {
                listener: listenerPath as string,
                update: undefined,
                resolved: undefined,
              },
              options,
              params: undefined,
            });
          }
        } else {
          for (const path in paths) {
            if (!this.isMuted(path) && !this.isMuted(fn)) {
              fn(paths[path], {
                type,
                listener,
                listenersCollection,
                path: {
                  listener: listenerPath as string,
                  update: undefined,
                  resolved: this.cleanNotRecursivePath(path),
                },
                params: this.getParams(listenersCollection.paramsInfo, path),
                options,
              });
            }
          }
        }
      }
    }
    this.debugSubscribe(listener, listenersCollection, listenerPath as string);
    return this.unsubscribe(listenerPath as string, this.id);
  }

  private unsubscribe(path: string, id: number) {
    const listeners = this.listeners;
    const listenersCollection = listeners.get(path);
    return function unsub() {
      listenersCollection.listeners.delete(id);
      listenersCollection.count--;
      if (listenersCollection.count === 0) {
        listeners.delete(path);
      }
    };
  }

  private runQueuedListeners() {
    if (this.destroyed) return;
    if (this.subscribeQueue.length === 0) return;
    const queue = [...this.subscribeQueue];
    for (let i = 0, len = queue.length; i < len; i++) {
      queue[i]();
    }
    this.subscribeQueue.length = 0;
  }

  private getQueueNotifyListeners(
    groupedListeners: GroupedListeners<PathValue<T, PossiblePath<T>>>,
    queue: Queue<PathValue<T, PossiblePath<T>>>[] = []
  ): Queue<PathValue<T, PossiblePath<T>>>[] {
    for (const path in groupedListeners) {
      if (this.isMuted(path)) continue;
      let { single, bulk } = groupedListeners[path];
      for (const singleListener of single) {
        let alreadyInQueue = false;
        let resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.resolved;
        if (!singleListener.eventInfo.path.resolved) {
          resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.listener;
        }
        for (const excludedListener of queue) {
          if (resolvedIdPath === excludedListener.resolvedIdPath) {
            alreadyInQueue = true;
            break;
          }
        }
        if (alreadyInQueue) {
          continue;
        }
        const time = this.debugTime(singleListener);
        if (!this.isMuted(singleListener.listener.fn)) {
          let resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.resolved;
          if (!singleListener.eventInfo.path.resolved) {
            resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.listener;
          }
          queue.push({
            id: singleListener.listener.id,
            resolvedPath: singleListener.eventInfo.path.resolved,
            resolvedIdPath,
            originalFn: singleListener.listener.fn,
            fn: () => {
              singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
            },
            options: singleListener.listener.options,
            groupId: singleListener.listener.groupId,
          });
        }
        this.debugListener(time, singleListener);
      }

      for (const bulkListener of bulk) {
        let alreadyInQueue = false;
        for (const excludedListener of queue) {
          if (excludedListener.id === bulkListener.listener.id) {
            alreadyInQueue = true;
            break;
          }
        }
        if (alreadyInQueue) continue;
        const time = this.debugTime(bulkListener);
        const bulkValue: Bulk[] = [];
        for (const bulk of bulkListener.value) {
          bulkValue.push({ ...bulk, value: bulk.value() });
        }
        if (!this.isMuted(bulkListener.listener.fn)) {
          let resolvedIdPath = bulkListener.listener.id + ":" + bulkListener.eventInfo.path.resolved;
          if (!bulkListener.eventInfo.path.resolved) {
            resolvedIdPath = bulkListener.listener.id + ":" + bulkListener.eventInfo.path.listener;
          }
          queue.push({
            id: bulkListener.listener.id,
            resolvedPath: bulkListener.eventInfo.path.resolved,
            resolvedIdPath,
            originalFn: bulkListener.listener.fn,
            fn: () => {
              bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
            },
            options: bulkListener.listener.options,
            groupId: bulkListener.listener.groupId,
          });
        }
        this.debugListener(time, bulkListener);
      }
    }
    Promise.resolve().then(() => this.runQueuedListeners());
    return queue;
  }

  private shouldIgnore(listener: Listener<PathValue<T, PossiblePath<T>>>, updatePath: string): boolean {
    if (!listener.options.ignore) return false;
    for (const ignorePath of listener.options.ignore) {
      if (updatePath.startsWith(ignorePath)) {
        return true;
      }
      if (this.is_match && this.is_match(ignorePath, updatePath)) {
        return true;
      } else {
        const cuttedUpdatePath = this.cutPath(updatePath, ignorePath);
        if (this.match(ignorePath, cuttedUpdatePath)) {
          return true;
        }
      }
    }
    return false;
  }

  private getSubscribedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners<PathValue<T, PossiblePath<T>>> {
    options = { ...defaultUpdateOptions, ...options };
    const listeners = {};
    for (let [listenerPath, listenersCollection] of this.listeners) {
      listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
      if (listenersCollection.match(updatePath)) {
        const params = listenersCollection.paramsInfo
          ? this.getParams(listenersCollection.paramsInfo, updatePath)
          : undefined;
        const cutPath = this.cutPath(updatePath, listenerPath);
        const traverse = listenersCollection.isRecursive || listenersCollection.isWildcard;
        const value = traverse ? () => this.get(cutPath) : () => newValue;
        const bulkValue: Bulk[] = [{ value, path: updatePath, params }];
        for (const listener of listenersCollection.listeners.values()) {
          if (this.shouldIgnore(listener, updatePath)) {
            if (listener.options.debug) {
              console.log(`[getSubscribedListeners] Listener was not fired because it was ignored.`, {
                listener,
                listenersCollection,
              });
            }
            continue;
          }
          if (listener.options.bulk) {
            listeners[listenerPath].bulk.push({
              listener,
              listenersCollection,
              eventInfo: {
                type,
                listener,
                path: {
                  listener: listenerPath,
                  update: originalPath ? originalPath : updatePath,
                  resolved: undefined,
                },
                params,
                options,
              },
              value: bulkValue,
            });
          } else {
            listeners[listenerPath].single.push({
              listener,
              listenersCollection,
              eventInfo: {
                type,
                listener,
                path: {
                  listener: listenerPath,
                  update: originalPath ? originalPath : updatePath,
                  resolved: this.cleanNotRecursivePath(updatePath),
                },
                params,
                options,
              },
              value,
            });
          }
        }
      } else if (this.options.extraDebug) {
        // debug
        let showMatch = false;
        for (const listener of listenersCollection.listeners.values()) {
          if (listener.options.debug) {
            showMatch = true;
            console.log(`[getSubscribedListeners] Listener was not fired because there was no match.`, {
              listener,
              listenersCollection,
              updatePath,
            });
          }
        }
        if (showMatch) {
          listenersCollection.match(updatePath, true);
        }
      }
    }
    return listeners;
  }

  private notifySubscribedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): Queue<PathValue<T, PossiblePath<T>>>[] {
    return this.getQueueNotifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
  }

  private getNestedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners<PathValue<T, PossiblePath<T>>> {
    const listeners: GroupedListeners<PathValue<T, PossiblePath<T>>> = {};
    for (let [listenerPath, listenersCollection] of this.listeners) {
      if (!listenersCollection.isRecursive) continue;
      listeners[listenerPath] = { single: [], bulk: [] };
      const currentCutPath = this.cutPath(listenerPath, updatePath);
      if (this.match(currentCutPath, updatePath)) {
        const restPath = this.trimPath(listenerPath.substr(currentCutPath.length));
        const wildcardNewValues = new WildcardObject(newValue, this.options.delimiter, this.options.wildcard).get(
          restPath
        );
        const params = listenersCollection.paramsInfo
          ? this.getParams(listenersCollection.paramsInfo, updatePath)
          : undefined;
        const bulk: Bulk[] = [];
        const bulkListeners = {};
        for (const currentRestPath in wildcardNewValues) {
          const value = () => wildcardNewValues[currentRestPath];
          const fullPath = [updatePath, currentRestPath].join(this.options.delimiter);
          for (const [listenerId, listener] of listenersCollection.listeners) {
            const eventInfo = {
              type,
              listener,
              listenersCollection,
              path: {
                listener: listenerPath,
                update: originalPath ? originalPath : updatePath,
                resolved: this.cleanNotRecursivePath(fullPath),
              },
              params,
              options,
            };
            if (this.shouldIgnore(listener, updatePath)) continue;
            if (listener.options.bulk) {
              bulk.push({ value, path: fullPath, params });
              bulkListeners[listenerId] = listener;
            } else {
              listeners[listenerPath].single.push({
                listener,
                listenersCollection,
                eventInfo,
                value,
              });
            }
          }
        }
        for (const listenerId in bulkListeners) {
          const listener = bulkListeners[listenerId];
          const eventInfo = {
            type,
            listener,
            listenersCollection,
            path: {
              listener: listenerPath,
              update: updatePath,
              resolved: undefined,
            },
            options,
            params,
          };
          listeners[listenerPath].bulk.push({
            listener,
            listenersCollection,
            eventInfo,
            value: bulk,
          });
        }
      } else if (this.options.extraDebug) {
        // debug
        for (const listener of listenersCollection.listeners.values()) {
          if (listener.options.debug) {
            console.log("[getNestedListeners] Listener was not fired because there was no match.", {
              listener,
              listenersCollection,
              currentCutPath,
              updatePath,
            });
          }
        }
      }
    }
    return listeners;
  }

  private notifyNestedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    queue: Queue<PathValue<T, PossiblePath<T>>>[],
    originalPath: string = null
  ): Queue<PathValue<T, PossiblePath<T>>>[] {
    return this.getQueueNotifyListeners(
      this.getNestedListeners(updatePath, newValue, options, type, originalPath),
      queue
    );
  }

  private getNotifyOnlyListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners<PathValue<T, PossiblePath<T>>> {
    const listeners = {};
    if (
      typeof options.only !== "object" ||
      !Array.isArray(options.only) ||
      typeof options.only[0] === "undefined" ||
      !this.canBeNested(newValue)
    ) {
      return listeners;
    }
    for (const notifyPath of options.only) {
      const wildcardScanNewValue = new WildcardObject(newValue, this.options.delimiter, this.options.wildcard).get(
        notifyPath
      );
      listeners[notifyPath] = { bulk: [], single: [] };
      for (const wildcardPath in wildcardScanNewValue) {
        const fullPath = updatePath + this.options.delimiter + wildcardPath;
        for (const [listenerPath, listenersCollection] of this.listeners) {
          const params = listenersCollection.paramsInfo
            ? this.getParams(listenersCollection.paramsInfo, fullPath)
            : undefined;
          if (this.match(listenerPath, fullPath)) {
            const value = () => wildcardScanNewValue[wildcardPath];
            const bulkValue = [{ value, path: fullPath, params }];
            for (const listener of listenersCollection.listeners.values()) {
              const eventInfo = {
                type,
                listener,
                listenersCollection,
                path: {
                  listener: listenerPath,
                  update: originalPath ? originalPath : updatePath,
                  resolved: this.cleanNotRecursivePath(fullPath),
                },
                params,
                options,
              };
              if (this.shouldIgnore(listener, updatePath)) continue;
              if (listener.options.bulk) {
                if (!listeners[notifyPath].bulk.some((bulkListener) => bulkListener.listener === listener)) {
                  listeners[notifyPath].bulk.push({
                    listener,
                    listenersCollection,
                    eventInfo,
                    value: bulkValue,
                  });
                }
              } else {
                listeners[notifyPath].single.push({
                  listener,
                  listenersCollection,
                  eventInfo,
                  value,
                });
              }
            }
          }
        }
      }
    }
    return listeners;
  }

  private runQueue(queue: Queue<PathValue<T, PossiblePath<T>>>[]) {
    const firedGroups = [];
    for (const q of queue) {
      if (q.options.group) {
        if (!firedGroups.includes(q.groupId)) {
          q.fn();
          firedGroups.push(q.groupId);
        }
      } else {
        q.fn();
      }
    }
  }

  private sortAndRunQueue(queue: Queue<PathValue<T, PossiblePath<T>>>[], path: string) {
    queue.sort(function (a, b) {
      return a.id - b.id;
    });
    if (this.options.debug) {
      console.log(`[deep-state-observer] queue for ${path}`, queue);
    }
    this.runQueue(queue);
  }

  private notifyOnly(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = ""
  ) {
    const queue = this.getQueueNotifyListeners(
      this.getNotifyOnlyListeners(updatePath, newValue, options, type, originalPath)
    );
    this.sortAndRunQueue(queue, updatePath);
  }

  private canBeNested(newValue): boolean {
    return typeof newValue === "object" && newValue !== null;
  }

  private getUpdateValues(oldValue, split, fn) {
    let newValue = fn;
    if (typeof fn === "function") {
      const silent = this.silent;
      this.silent = true;
      newValue = fn(this.pathGet(split, this.data));
      this.silent = silent;
    }
    if (isObject(newValue) || Array.isArray(newValue))
      newValue = this.makeObservable(newValue, split.join(this.options.delimiter));
    return { newValue, oldValue };
  }

  private wildcardNotify(groupedListenersPack) {
    let queue = [];
    for (const groupedListeners of groupedListenersPack) {
      this.getQueueNotifyListeners(groupedListeners, queue);
    }
    return queue;
  }

  private wildcardUpdate(
    updatePath: string,
    fn: Updater | any,
    options: UpdateOptions = defaultUpdateOptions,
    multi = false
  ) {
    options = { ...defaultUpdateOptions, ...options };
    const scanned = this.scan.get(updatePath);
    const updated = {};
    for (const path in scanned) {
      const split = this.split(path);
      const parent = this.getParent(path);
      if (parent) parent[this.proxyProperty].saving = true;
      const { oldValue, newValue } = this.getUpdateValues(scanned[path], split, fn);
      if (!this.same(newValue, oldValue) || options.force) {
        this.pathSet(split, newValue, this.data);
        updated[path] = newValue;
      }
    }

    const groupedListenersPack = [];
    for (const path in updated) {
      const newValue = updated[path];
      if (options.only.length) {
        groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, options, "update", updatePath));
      } else {
        groupedListenersPack.push(this.getSubscribedListeners(path, newValue, options, "update", updatePath));
        if (this.canBeNested(newValue)) {
          groupedListenersPack.push(this.getNestedListeners(path, newValue, options, "update", updatePath));
        }
      }
      options.debug && this.options.log("Wildcard update", { path, newValue });
    }
    if (multi) {
      const self = this;
      return function () {
        const queue = self.wildcardNotify(groupedListenersPack);
        self.sortAndRunQueue(queue, updatePath);
        for (const path in scanned) {
          const parent = self.getParent(path);
          if (parent) parent[self.proxyProperty].saving = false;
        }
      };
    }
    const queue = this.wildcardNotify(groupedListenersPack);
    this.sortAndRunQueue(queue, updatePath);
    for (const path in scanned) {
      const parent = this.getParent(path);
      if (parent) parent[this.proxyProperty].saving = false;
    }
  }

  private updateNotify(updatePath: string, newValue: unknown, options: UpdateOptions) {
    const queue = this.notifySubscribedListeners(updatePath, newValue, options);
    if (this.canBeNested(newValue)) {
      this.notifyNestedListeners(updatePath, newValue, options, "update", queue);
    }
    this.sortAndRunQueue(queue, updatePath);
  }

  private updateNotifyAll(updateStack: UpdateStack[]) {
    let queue = [];
    for (const current of updateStack) {
      const value = current.newValue;
      if (this.tracing.length) {
        const traceId = this.tracing[this.tracing.length - 1];
        const trace = this.traceMap.get(traceId);
        trace.changed.push({
          traceId,
          updatePath: current.updatePath,
          fnOrValue: value,
          options: current.options,
        });
        this.traceMap.set(traceId, trace);
      }
      queue = queue.concat(this.notifySubscribedListeners(current.updatePath, value, current.options));
      if (this.canBeNested(current.newValue)) {
        this.notifyNestedListeners(current.updatePath, value, current.options, "update", queue);
      }
    }
    this.runQueue(queue);
  }

  private updateNotifyOnly(updatePath, newValue, options) {
    this.notifyOnly(updatePath, newValue, options);
  }

  public update(
    updatePath: string,
    fnOrValue: Updater | any,
    options: UpdateOptions = { ...defaultUpdateOptions },
    multi = false
  ) {
    if (this.destroyed) return;
    if (this.collection) {
      return this.collection.update(updatePath, fnOrValue, options);
    }
    if (this.tracing.length) {
      const traceId = this.tracing[this.tracing.length - 1];
      const trace = this.traceMap.get(traceId);
      trace.changed.push({ traceId, updatePath, fnOrValue, options });
      this.traceMap.set(traceId, trace);
    }
    if (this.isWildcard(updatePath)) {
      return this.wildcardUpdate(updatePath, fnOrValue, options, multi);
    }
    const split = this.split(updatePath);
    const currentValue = this.pathGet(split, this.data);

    const parent = this.getParent(updatePath);
    if (parent) parent[this.proxyProperty].saving = true; // parent here because getUpdateValues will fire update fn
    let { oldValue, newValue } = this.getUpdateValues(currentValue, split, fnOrValue);
    if (options.debug) {
      this.options.log(`Updating ${updatePath} ${options.source ? `from ${options.source}` : ""}`, {
        oldValue,
        newValue,
      });
    }

    if (this.same(newValue, oldValue) && !options.force) {
      if (multi)
        return function () {
          return newValue;
        };
      return newValue;
    }

    this.pathSet(split, newValue, this.data);

    options = { ...defaultUpdateOptions, ...options };
    if (options.only === null) {
      if (multi) return function () {};
      if (parent) parent[this.proxyProperty].saving = false;
      return newValue;
    }
    if (options.only.length) {
      if (multi) {
        const self = this;
        return function () {
          const result = self.updateNotifyOnly(updatePath, newValue, options);
          if (parent) parent[self.proxyProperty].saving = false;
          return result;
        };
      }
      this.updateNotifyOnly(updatePath, newValue, options);
      if (parent) parent[this.proxyProperty].saving = false;
      return newValue;
    }
    if (multi) {
      const self = this;
      return function multiUpdate() {
        const result = self.updateNotify(updatePath, newValue, options);
        if (parent) parent[self.proxyProperty].saving = false;
        return result;
      };
    }
    this.updateNotify(updatePath, newValue, options);
    if (parent) parent[this.proxyProperty].saving = false;
    return newValue;
  }

  public multi(grouped: boolean = false): Multi {
    if (this.destroyed)
      return {
        update() {
          return this;
        },
        done() {},
        getStack() {
          return [];
        },
      };
    if (this.collection) return this.collection;
    const self = this;
    const updateStack: UpdateStack[] = [];
    const notifiers = [];
    const multiObject: Multi = {
      update(updatePath: string, fnOrValue: Updater | any, options: UpdateOptions = defaultUpdateOptions) {
        if (grouped) {
          const split = self.split(updatePath);
          let value = fnOrValue;
          if (typeof value === "function") {
            value = value(self.pathGet(split, self.data));
          }
          if (isObject(value) || Array.isArray(value)) {
            value = self.makeObservable(value, updatePath);
          }
          const parent = self.getParent(updatePath);
          parent[self.proxyProperty].saving = true;
          self.pathSet(split, value, self.data);
          parent[self.proxyProperty].saving = false;
          updateStack.push({ updatePath, newValue: value, options });
        } else {
          notifiers.push(self.update(updatePath, fnOrValue, options, true));
        }
        return this;
      },
      done() {
        if (self.collections !== 0) {
          return;
        }
        if (grouped) {
          self.updateNotifyAll(updateStack);
        } else {
          for (const current of notifiers) {
            current();
          }
        }
        updateStack.length = 0;
      },
      getStack() {
        return updateStack;
      },
    };
    return multiObject;
  }

  public collect() {
    this.collections++;
    if (!this.collection) {
      this.collection = this.multi(true);
    }
    return this.collection;
  }

  public executeCollected() {
    this.collections--;
    if (this.collections === 0 && this.collection) {
      const collection = this.collection;
      this.collection = null;
      collection.done();
    }
  }

  public getCollectedCount() {
    return this.collections;
  }

  public getCollectedStack(): UpdateStack[] {
    if (!this.collection) return [];
    return this.collection.getStack();
  }

  public get<P extends PossiblePath<T>>(userPath: P): PathValue<T, P> {
    if (this.destroyed) return;
    if (typeof userPath === "undefined" || userPath === "") {
      return this.data;
    }
    return this.pathGet(this.split(userPath as string), this.data);
  }

  private lastExecs: WeakMap<() => void, { calls: number }> = new WeakMap();
  public last(callback: () => void) {
    let last = this.lastExecs.get(callback);
    if (!last) {
      last = { calls: 0 };
      this.lastExecs.set(callback, last);
    }
    const current = ++last.calls;
    this.resolved.then(() => {
      if (current === last.calls) {
        this.lastExecs.set(callback, { calls: 0 });
        callback();
      }
    });
  }

  public isMuted(pathOrListenerFunction: string | ListenerFunction<PathValue<T, PossiblePath<T>>>): boolean {
    if (!this.options.useMute) return false;
    if (typeof pathOrListenerFunction === "function") {
      return this.isMutedListener(pathOrListenerFunction);
    }
    for (const mutedPath of this.muted) {
      const recursive = !this.isNotRecursive(mutedPath);
      const trimmedMutedPath = this.trimPath(mutedPath);
      if (this.match(pathOrListenerFunction, trimmedMutedPath)) return true;
      if (this.match(trimmedMutedPath, pathOrListenerFunction)) return true;
      if (recursive) {
        const cutPath = this.cutPath(trimmedMutedPath, pathOrListenerFunction);
        if (this.match(cutPath, mutedPath)) return true;
        if (this.match(mutedPath, cutPath)) return true;
      }
    }
    return false;
  }

  public isMutedListener(listenerFunc: ListenerFunction<PathValue<T, PossiblePath<T>>>): boolean {
    return this.mutedListeners.has(listenerFunc);
  }

  public mute(pathOrListenerFunction: string | ListenerFunction<PathValue<T, PossiblePath<T>>>) {
    if (typeof pathOrListenerFunction === "function") {
      return this.mutedListeners.add(pathOrListenerFunction);
    }
    this.muted.add(pathOrListenerFunction);
  }

  public unmute(pathOrListenerFunction: string | ListenerFunction<PathValue<T, PossiblePath<T>>>) {
    if (typeof pathOrListenerFunction === "function") {
      return this.mutedListeners.delete(pathOrListenerFunction);
    }
    this.muted.delete(pathOrListenerFunction);
  }

  private debugSubscribe(
    listener: Listener<PathValue<T, PossiblePath<T>>>,
    listenersCollection: ListenersCollection<T>,
    listenerPath: string
  ) {
    if (listener.options.debug) {
      this.options.log("listener subscribed", {
        listenerPath,
        listener,
        listenersCollection,
      });
    }
  }

  private debugListener(time: number, groupedListener: GroupedListener<PathValue<T, PossiblePath<T>>>) {
    if (groupedListener.eventInfo.options.debug || groupedListener.listener.options.debug) {
      this.options.log("Listener fired", {
        time: Date.now() - time,
        info: groupedListener,
      });
    }
  }

  private debugTime(groupedListener: GroupedListener<PathValue<T, PossiblePath<T>>>): number {
    return groupedListener.listener.options.debug || groupedListener.eventInfo.options.debug ? Date.now() : 0;
  }

  public startTrace(name: string, additionalData: any = null) {
    this.traceId++;
    const id = this.traceId + ":" + name;
    this.traceMap.set(id, {
      id,
      sort: this.traceId,
      stack: this.tracing.map((i) => i),
      additionalData,
      changed: [],
    });
    this.tracing.push(id);
    return id;
  }

  public stopTrace(id: string) {
    const result = this.traceMap.get(id);
    this.tracing.pop();
    this.traceMap.delete(id);
    return result;
  }

  public saveTrace(id: string) {
    const result = this.traceMap.get(id);
    this.tracing.pop();
    this.traceMap.delete(id);
    this.savedTrace.push(result);
    return result;
  }

  public getSavedTraces() {
    const savedTrace = this.savedTrace.map((trace) => trace);
    savedTrace.sort((a, b) => {
      return a.sort - b.sort;
    });
    this.savedTrace = [];
    return savedTrace;
  }
}
export default DeepState;
