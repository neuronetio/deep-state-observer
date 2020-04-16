import WildcardObject from "./wildcard-object-scan";
import Path from "./ObjectPath";

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

export type ListenerFunction = (value: any, eventInfo: ListenerFunctionEventInfo) => void;
export type Match = (path: string) => boolean;

export interface Options {
  delimeter: string;
  notRecursive: string;
  param: string;
  wildcard: string;
  queue: boolean;
  maxSimultaneousJobs: number;
  log: (message: string, info: any) => void;
}

export type ChangeDetection = (newValue: unknown, oldValue: unknown, path: string) => boolean;

export interface ListenerOptions {
  bulk?: boolean;
  debug?: boolean;
  source?: string;
  data?: any;
  queue?: boolean;
  changeDetection?: ChangeDetection;
}

export interface UpdateOptions {
  only?: string[];
  source?: string;
  debug?: boolean;
  data?: any;
  queue?: boolean;
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

export type Updater = (value: any) => any;

export type ListenersObject = Map<string | number, Listener>;

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

export type Listeners = Map<string, ListenersCollection>;

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

function clone(obj: object, parsed = []) {
  if (obj === null || typeof obj !== "object" || parsed.includes(obj)) return obj;
  if (obj.constructor && obj.constructor.name !== "Object" && !Array.isArray(obj)) return obj;
  parsed.push(obj);
  let temp = {};
  if (Array.isArray(obj)) {
    temp = new Array(obj.length);
    for (let i = 0, len = obj.length; i < len; i++) {
      // @ts-ignore
      temp[i] = clone(obj[i]);
    }
  } else {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        temp[key] = clone(obj[key], parsed);
      }
    }
  }
  return temp;
}

function log(message: string, info: any) {
  console.debug(message, info);
}

const defaultOptions: Options = {
  delimeter: `.`,
  notRecursive: `;`,
  param: `:`,
  wildcard: `*`,
  queue: false,
  maxSimultaneousJobs: 1000,
  log,
};

const defaultListenerOptions: ListenerOptions = {
  bulk: false,
  debug: false,
  source: "",
  data: undefined,
  queue: false,
  changeDetection(newValue, oldValue) {
    return !(
      (["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
      oldValue === newValue
    );
  },
};

const defaultUpdateOptions: UpdateOptions = {
  only: [],
  source: "",
  debug: false,
  data: undefined,
  queue: false,
};

class DeepState {
  private listeners: Listeners;
  private waitingListeners: WaitingListeners;
  private data: object;
  private oldData: object;
  private options: Options;
  private id: number;
  private pathGet: any;
  private pathSet: any;
  private scan: any;
  private jobsRunning = 0;
  private updateQueue = [];
  private subscribeQueue = [];

  constructor(data = {}, options: Options = defaultOptions) {
    this.listeners = new Map();
    this.waitingListeners = new Map();
    this.data = data;
    this.oldData = this.copy(data);
    this.options = { ...defaultOptions, ...options };
    this.id = 0;
    this.pathGet = Path.get;
    this.pathSet = Path.set;
    this.scan = new WildcardObject(this.data, this.options.delimeter, this.options.wildcard);
  }

  public getListeners(): Listeners {
    return this.listeners;
  }

  public destroy() {
    this.data = undefined;
    this.listeners = new Map();
  }

  private match(first: string, second: string): boolean {
    if (first === second) return true;
    if (first === this.options.wildcard || second === this.options.wildcard) return true;
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
    const shorterPartsLen = this.getIndicesCount(this.options.delimeter, shorter);
    const longerParts = this.getIndicesOf(this.options.delimeter, longer);
    return longer.substr(0, longerParts[shorterPartsLen]);
  }

  private trimPath(path: string): string {
    path = this.cleanNotRecursivePath(path);
    if (path.charAt(0) === this.options.delimeter) {
      return path.substr(1);
    }
    return path;
  }

  private split(path: string) {
    return path === "" ? [] : path.split(this.options.delimeter);
  }

  private isWildcard(path: string): boolean {
    return path.includes(this.options.wildcard);
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
      const reg = new RegExp(`\\${this.options.param}([^\\${this.options.delimeter}\\${this.options.param}]+)`, "g");
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
    paramsInfo.replaced = fullReplaced.join(this.options.delimeter);
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

  public waitForAll(userPaths: string[], fn: WaitingListenerFunction) {
    const paths = {};
    for (let path of userPaths) {
      paths[path] = { dirty: false };
      if (this.hasParams(path)) {
        paths[path].paramsInfo = this.getParamsInfo(path);
      }
      paths[path].isWildcard = this.isWildcard(path);
      paths[path].isRecursive = !this.isNotRecursive(path);
    }
    this.waitingListeners.set(userPaths, { fn, paths });
    fn(paths);
    return function unsubscribe() {
      this.waitingListeners.delete(userPaths);
    };
  }

  private executeWaitingListeners(updatePath: string) {
    for (const waitingListener of this.waitingListeners.values()) {
      const { fn, paths } = waitingListener;
      let dirty = 0;
      let all = 0;
      for (let path in paths) {
        const pathInfo = paths[path];
        let match = false;
        if (pathInfo.isRecursive) updatePath = this.cutPath(updatePath, path);
        if (pathInfo.isWildcard && this.match(path, updatePath)) match = true;
        if (updatePath === path) match = true;
        if (match) {
          pathInfo.dirty = true;
        }
        if (pathInfo.dirty) {
          dirty++;
        }
        all++;
      }
      if (dirty === all) {
        fn(paths);
      }
    }
  }

  public subscribeAll(
    userPaths: string[],
    fn: ListenerFunction | WaitingListenerFunction,
    options: ListenerOptions = defaultListenerOptions
  ) {
    let unsubscribers = [];
    for (const userPath of userPaths) {
      unsubscribers.push(this.subscribe(userPath, fn, options));
    }
    return function unsubscribe() {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }

  private getCleanListenersCollection(values = {}): ListenersCollection {
    return {
      listeners: new Map(),
      isRecursive: false,
      isWildcard: false,
      hasParams: false,
      match: undefined,
      paramsInfo: undefined,
      path: undefined,
      count: 0,
      ...values,
    };
  }

  private getCleanListener(fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions): Listener {
    return {
      fn,
      options: { ...defaultListenerOptions, ...options },
    };
  }

  private getListenerCollectionMatch(listenerPath: string, isRecursive: boolean, isWildcard: boolean) {
    listenerPath = this.cleanNotRecursivePath(listenerPath);
    const self = this;
    return function listenerCollectionMatch(path) {
      if (isRecursive) path = self.cutPath(path, listenerPath);
      if (isWildcard && self.match(listenerPath, path)) return true;
      return listenerPath === path;
    };
  }

  private getListenersCollection(listenerPath: string, listener: Listener): ListenersCollection {
    if (this.listeners.has(listenerPath)) {
      let listenersCollection = this.listeners.get(listenerPath);
      listenersCollection.listeners.set(++this.id, listener);
      return listenersCollection;
    }
    let collCfg = {
      isRecursive: true,
      isWildcard: false,
      hasParams: false,
      paramsInfo: undefined,
      originalPath: listenerPath,
      path: listenerPath,
    };
    if (this.hasParams(collCfg.path)) {
      collCfg.paramsInfo = this.getParamsInfo(collCfg.path);
      collCfg.path = collCfg.paramsInfo.replaced;
      collCfg.hasParams = true;
    }
    collCfg.isWildcard = this.isWildcard(collCfg.path);
    if (this.isNotRecursive(collCfg.path)) {
      collCfg.isRecursive = false;
    }
    let listenersCollection = this.getCleanListenersCollection({
      ...collCfg,
      match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard),
    });
    this.id++;
    listenersCollection.listeners.set(this.id, listener);
    this.listeners.set(collCfg.path, listenersCollection);
    return listenersCollection;
  }

  public subscribe(
    listenerPath: string,
    fn: ListenerFunction,
    options: ListenerOptions = defaultListenerOptions,
    type: string = "subscribe"
  ) {
    this.jobsRunning++;
    let listener = this.getCleanListener(fn, options);
    const listenersCollection = this.getListenersCollection(listenerPath, listener);
    listenersCollection.count++;
    listenerPath = listenersCollection.path;
    if (!listenersCollection.isWildcard) {
      fn(this.pathGet(this.split(this.cleanNotRecursivePath(listenerPath)), this.data), {
        type,
        listener,
        listenersCollection,
        path: {
          listener: listenerPath,
          update: undefined,
          resolved: this.cleanNotRecursivePath(listenerPath),
        },
        params: this.getParams(listenersCollection.paramsInfo, listenerPath),
        options,
      });
    } else {
      const paths = this.scan.get(this.cleanNotRecursivePath(listenerPath));
      if (options.bulk) {
        const bulkValue = [];
        for (const path in paths) {
          bulkValue.push({
            path,
            params: this.getParams(listenersCollection.paramsInfo, path),
            value: paths[path],
          });
        }
        fn(bulkValue, {
          type,
          listener,
          listenersCollection,
          path: {
            listener: listenerPath,
            update: undefined,
            resolved: undefined,
          },
          options,
          params: undefined,
        });
      } else {
        for (const path in paths) {
          fn(paths[path], {
            type,
            listener,
            listenersCollection,
            path: {
              listener: listenerPath,
              update: undefined,
              resolved: this.cleanNotRecursivePath(path),
            },
            params: this.getParams(listenersCollection.paramsInfo, path),
            options,
          });
        }
      }
    }
    this.debugSubscribe(listener, listenersCollection, listenerPath);
    this.jobsRunning--;
    return this.unsubscribe(listenerPath, this.id);
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
    if (this.subscribeQueue.length === 0) return;
    if (this.jobsRunning === 0) {
      const queue = [...this.subscribeQueue];
      for (let i = 0, len = queue.length; i < len; i++) {
        queue[i]();
      }
      this.subscribeQueue.length = 0;
    } else {
      Promise.resolve().then(() => this.runQueuedListeners());
    }
  }

  private notifyListeners(
    listeners: GroupedListeners,
    exclude: GroupedListener[] = [],
    returnNotified: boolean = true
  ): GroupedListener[] {
    const alreadyNotified = [];
    for (const path in listeners) {
      let { single, bulk } = listeners[path];
      for (const singleListener of single) {
        if (exclude.includes(singleListener)) continue;
        const time = this.debugTime(singleListener);
        if (singleListener.listener.options.queue && this.jobsRunning) {
          this.subscribeQueue.push(() => {
            singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
          });
        } else {
          singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
        }
        if (returnNotified) alreadyNotified.push(singleListener);
        this.debugListener(time, singleListener);
      }
      for (const bulkListener of bulk) {
        if (exclude.includes(bulkListener)) continue;
        const time = this.debugTime(bulkListener);
        const bulkValue = [];
        for (const bulk of bulkListener.value) {
          bulkValue.push({ ...bulk, value: bulk.value() });
        }
        if (bulkListener.listener.options.queue && this.jobsRunning) {
          this.subscribeQueue.push(() => {
            if (!this.jobsRunning) {
              bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
              return true;
            }
            return false;
          });
        } else {
          bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
        }
        if (returnNotified) alreadyNotified.push(bulkListener);
        this.debugListener(time, bulkListener);
      }
    }
    Promise.resolve().then(() => this.runQueuedListeners());
    return alreadyNotified;
  }

  private getSubscribedListeners(
    updatePath: string,
    newValue,
    oldValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners {
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
        const old = traverse ? () => this.pathGet(this.split(cutPath), this.oldData) : () => oldValue;
        const bulkValue = [{ value, path: updatePath, params }];
        for (const listener of listenersCollection.listeners.values()) {
          if (listener.options.changeDetection(value(), old(), updatePath)) {
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
        }
      }
    }
    return listeners;
  }

  private notifySubscribedListeners(
    updatePath: string,
    newValue,
    oldValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListener[] {
    return this.notifyListeners(
      this.getSubscribedListeners(updatePath, newValue, oldValue, options, type, originalPath)
    );
  }

  private getNestedListeners(
    updatePath: string,
    newValue,
    oldValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners {
    const listeners: GroupedListeners = {};
    for (let [listenerPath, listenersCollection] of this.listeners) {
      listeners[listenerPath] = { single: [], bulk: [] };
      const currentCuttedPath = this.cutPath(listenerPath, updatePath);
      if (this.match(currentCuttedPath, updatePath)) {
        const restPath = this.trimPath(listenerPath.substr(currentCuttedPath.length));
        const wildcardNewValues = new WildcardObject(newValue, this.options.delimeter, this.options.wildcard).get(
          restPath
        );
        const wildcardOldValues = new WildcardObject(oldValue, this.options.delimeter, this.options.wildcard).get(
          restPath
        );
        const params = listenersCollection.paramsInfo
          ? this.getParams(listenersCollection.paramsInfo, updatePath)
          : undefined;
        const bulk = [];
        const bulkListeners = {};
        for (const currentRestPath in wildcardNewValues) {
          const value = () => wildcardNewValues[currentRestPath];
          const oldValue = () => wildcardOldValues[currentRestPath];
          const fullPath = [updatePath, currentRestPath].join(this.options.delimeter);
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
            if (
              listener.options.changeDetection(
                wildcardNewValues[currentRestPath],
                wildcardOldValues[currentRestPath],
                updatePath
              )
            ) {
              if (listener.options.bulk) {
                bulk.push({ value, oldValue, path: fullPath, params });
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
      }
    }
    return listeners;
  }

  private notifyNestedListeners(
    updatePath: string,
    newValue,
    oldValue,
    options: UpdateOptions,
    type: string = "update",
    alreadyNotified: GroupedListener[],
    originalPath: string = null
  ) {
    return this.notifyListeners(
      this.getNestedListeners(updatePath, newValue, oldValue, options, type, originalPath),
      alreadyNotified,
      false
    );
  }

  private getNotifyOnlyListeners(
    updatePath: string,
    newValue,
    oldValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners {
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
      const wildcardScanNewValue = new WildcardObject(newValue, this.options.delimeter, this.options.wildcard).get(
        notifyPath
      );
      const wildcardScanOldValue = new WildcardObject(oldValue, this.options.delimeter, this.options.wildcard).get(
        notifyPath
      );
      listeners[notifyPath] = { bulk: [], single: [] };
      for (const wildcardPath in wildcardScanNewValue) {
        const fullPath = updatePath + this.options.delimeter + wildcardPath;
        for (const [listenerPath, listenersCollection] of this.listeners) {
          const params = listenersCollection.paramsInfo
            ? this.getParams(listenersCollection.paramsInfo, fullPath)
            : undefined;
          if (this.match(listenerPath, fullPath)) {
            const value = () => wildcardScanNewValue[wildcardPath];
            const old = () => wildcardScanOldValue[wildcardPath];
            const bulkValue = [{ value, oldValue: old, path: fullPath, params }];
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
              if (
                listener.options.changeDetection(
                  wildcardScanNewValue[wildcardPath],
                  wildcardScanOldValue[wildcardPath],
                  updatePath
                )
              ) {
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
    }
    return listeners;
  }

  private notifyOnly(
    updatePath: string,
    newValue,
    oldValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = ""
  ): boolean {
    return (
      typeof this.notifyListeners(
        this.getNotifyOnlyListeners(updatePath, newValue, oldValue, options, type, originalPath)
      )[0] !== "undefined"
    );
  }

  private canBeNested(newValue): boolean {
    return typeof newValue === "object" && newValue !== null;
  }

  private copy(value: any) {
    let copied = value;
    if (typeof value === "object" && value !== null) {
      if (typeof value.clone === "function") {
        copied = value.clone();
      } else if (Array.isArray(value)) {
        copied = new Array(value.length);
        for (let i = 0, len = value.length; i < len; i++) {
          copied[i] = this.copy(value[i]);
        }
      } else {
        copied = clone(value);
      }
    }
    return copied;
  }

  private getUpdateValues(oldValue, split, fn) {
    oldValue = this.copy(oldValue);
    let newValue = fn;
    if (typeof fn === "function") {
      newValue = fn(this.pathGet(split, this.data));
    }
    return { newValue, oldValue };
  }

  private wildcardNotify(groupedListenersPack, waitingPaths) {
    let alreadyNotified = [];
    for (const groupedListeners of groupedListenersPack) {
      alreadyNotified = [...alreadyNotified, ...this.notifyListeners(groupedListeners, alreadyNotified)];
    }
    for (const path of waitingPaths) {
      this.executeWaitingListeners(path);
    }
    this.jobsRunning--;
  }

  private wildcardUpdate(
    updatePath: string,
    fn: Updater | any,
    options: UpdateOptions = defaultUpdateOptions,
    multi = false
  ) {
    ++this.jobsRunning;
    options = { ...defaultUpdateOptions, ...options };
    const scanned = this.scan.get(updatePath);
    const bulk = {};
    for (const path in scanned) {
      const split = this.split(path);
      const { newValue } = this.getUpdateValues(scanned[path], split, fn);
      this.pathSet(split, newValue, this.data);
      bulk[path] = newValue;
    }
    const groupedListenersPack = [];
    const waitingPaths = [];
    for (const path in bulk) {
      const newValue = bulk[path];
      const oldValue = this.pathGet(this.split(path), this.oldData);
      if (options.only.length) {
        groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, oldValue, options, "update", updatePath));
      } else {
        groupedListenersPack.push(this.getSubscribedListeners(path, newValue, oldValue, options, "update", updatePath));
        this.canBeNested(newValue) &&
          groupedListenersPack.push(this.getNestedListeners(path, newValue, oldValue, options, "update", updatePath));
      }
      options.debug && this.options.log("Wildcard update", { path, newValue });
      waitingPaths.push(path);
    }
    if (multi) {
      return () => {
        this.wildcardNotify(groupedListenersPack, waitingPaths);
        for (const path in bulk) {
          this.pathSet(this.split(path), this.copy(bulk[path]), this.oldData);
        }
      };
    }
    this.wildcardNotify(groupedListenersPack, waitingPaths);
    for (const path in bulk) {
      this.pathSet(this.split(path), this.copy(bulk[path]), this.oldData);
    }
  }

  private runUpdateQueue() {
    while (this.updateQueue.length && this.updateQueue.length < this.options.maxSimultaneousJobs) {
      const params = this.updateQueue.shift();
      params.options.queue = false; // prevent infinite loop
      this.update(params.updatePath, params.fnOrValue, params.options, params.multi);
    }
  }

  private updateNotify(updatePath: string, newValue: unknown, oldValue: unknown, options: UpdateOptions) {
    const alreadyNotified = this.notifySubscribedListeners(updatePath, newValue, oldValue, options);
    if (this.canBeNested(newValue)) {
      this.notifyNestedListeners(updatePath, newValue, oldValue, options, "update", alreadyNotified);
    }
    this.executeWaitingListeners(updatePath);
  }

  private updateNotifyOnly(updatePath, newValue, oldValue, options) {
    this.notifyOnly(updatePath, newValue, oldValue, options);
    this.executeWaitingListeners(updatePath);
  }

  public update(
    updatePath: string,
    fnOrValue: Updater | any,
    options: UpdateOptions = defaultUpdateOptions,
    multi = false
  ) {
    const jobsRunning = this.jobsRunning;
    if ((this.options.queue || options.queue) && jobsRunning) {
      if (jobsRunning > this.options.maxSimultaneousJobs) {
        throw new Error("Maximal simultaneous jobs limit reached.");
      }
      this.updateQueue.push({ updatePath, fnOrValue, options, multi });
      const result = Promise.resolve().then(() => {
        this.runUpdateQueue();
      });
      if (multi) {
        return () => result;
      }
      return result;
    }
    if (this.isWildcard(updatePath)) {
      return this.wildcardUpdate(updatePath, fnOrValue, options, multi);
    }
    ++this.jobsRunning;
    const split = this.split(updatePath);
    const { oldValue, newValue } = this.getUpdateValues(this.pathGet(split, this.data), split, fnOrValue);
    if (options.debug) {
      this.options.log(`Updating ${updatePath} ${options.source ? `from ${options.source}` : ""}`, {
        oldValue,
        newValue,
      });
    }
    // if (this.same(newValue, oldValue)) {
    //   --this.jobsRunning;
    //   if (multi) return () => newValue;
    //   return newValue;
    // }

    this.pathSet(split, newValue, this.data);
    options = { ...defaultUpdateOptions, ...options };
    if (options.only === null) {
      --this.jobsRunning;
      this.pathSet(split, this.copy(newValue), this.oldData);
      if (multi) return () => {};
      return newValue;
    }
    if (options.only.length) {
      --this.jobsRunning;
      if (multi) {
        return () => {
          this.updateNotifyOnly(updatePath, newValue, oldValue, options);
          this.pathSet(split, this.copy(newValue), this.oldData);
        };
      }
      this.updateNotifyOnly(updatePath, newValue, oldValue, options);
      this.pathSet(split, this.copy(newValue), this.oldData);
      return newValue;
    }
    if (multi) {
      --this.jobsRunning;
      return () => {
        this.updateNotify(updatePath, newValue, oldValue, options);
        this.pathSet(split, this.copy(newValue), this.oldData);
      };
    }
    this.updateNotify(updatePath, newValue, oldValue, options);
    this.pathSet(split, this.copy(newValue), this.oldData);
    --this.jobsRunning;
    return newValue;
  }

  public multi() {
    const self = this;
    const notifiers = [];
    const multiObject = {
      update(updatePath: string, fn: Updater | any, options: UpdateOptions = defaultUpdateOptions) {
        notifiers.push(self.update(updatePath, fn, options, true));
        return this;
      },
      done() {
        for (let i = 0, len = notifiers.length; i < len; i++) {
          notifiers[i]();
        }
        notifiers.length = 0;
      },
    };
    return multiObject;
  }

  public get(userPath: string | undefined = undefined) {
    if (typeof userPath === "undefined" || userPath === "") {
      return this.data;
    }
    return this.pathGet(this.split(userPath), this.data);
  }

  private debugSubscribe(listener: Listener, listenersCollection: ListenersCollection, listenerPath: string) {
    if (listener.options.debug) {
      this.options.log("listener subscribed", {
        listenerPath,
        listener,
        listenersCollection,
      });
    }
  }

  private debugListener(time: number, groupedListener: GroupedListener) {
    if (groupedListener.eventInfo.options.debug || groupedListener.listener.options.debug) {
      this.options.log("Listener fired", {
        time: Date.now() - time,
        info: groupedListener,
      });
    }
  }

  private debugTime(groupedListener: GroupedListener): number {
    return groupedListener.listener.options.debug || groupedListener.eventInfo.options.debug ? Date.now() : 0;
  }
}
export default DeepState;
export const State = DeepState;
