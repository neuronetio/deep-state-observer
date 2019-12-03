import WildcardObject, { wildcardApi } from "./wildcard-object-scan";
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

export type ListenerFunction = (
  value: any,
  eventInfo: ListenerFunctionEventInfo
) => {};
export type Match = (path: string) => boolean;

export interface Options {
  delimeter: string;
  notRecursive: string;
  param: string;
  wildcard: string;
  log: (message: string, info: any) => void;
}

export interface ListenerOptions {
  bulk: boolean;
  debug: boolean;
  source: string;
  data: any;
  waitForAll: boolean;
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

export type Updater = (value: any) => {};

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
}

function log(message: string, info: any) {
  console.debug(message, info);
}

const defaultOptions: Options = {
  delimeter: `.`,
  notRecursive: `;`,
  param: `:`,
  wildcard: `*`,
  log
};
const defaultListenerOptions: ListenerOptions = {
  bulk: false,
  debug: false,
  source: "",
  data: undefined,
  waitForAll: false
};
const defaultUpdateOptions: UpdateOptions = {
  only: [],
  source: "",
  debug: false,
  data: undefined
};

class DeepState {
  private listeners: Listeners;
  private data: object;
  private options: Options;
  private id: number;
  private pathGet: any;
  private pathSet: any;
  private scan: any;
  private waitingListeners: Listeners;

  constructor(data = {}, options: Options = defaultOptions) {
    this.listeners = new Map();
    this.data = data;
    this.options = { ...defaultOptions, ...options };
    this.id = 0;
    this.pathGet = Path.get;
    this.pathSet = Path.set;
    this.scan = new WildcardObject(
      this.data,
      this.options.delimeter,
      this.options.wildcard
    );
    this.waitingListeners = new Map();
  }

  getListeners(): Listeners {
    return this.listeners;
  }

  destroy() {
    this.data = undefined;
    this.listeners = new Map();
  }

  match(first: string, second: string): boolean {
    if (first === second) return true;
    if (first === this.options.wildcard || second === this.options.wildcard)
      return true;
    return this.scan.match(first, second);
  }

  getIndicesOf(searchStr: string, str: string): number[] {
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

  getIndicesCount(searchStr: string, str: string): number {
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

  cutPath(longer: string, shorter: string): string {
    longer = this.cleanNotRecursivePath(longer);
    shorter = this.cleanNotRecursivePath(shorter);
    const shorterPartsLen = this.getIndicesCount(
      this.options.delimeter,
      shorter
    );
    const longerParts = this.getIndicesOf(this.options.delimeter, longer);
    return longer.substr(0, longerParts[shorterPartsLen]);
  }

  trimPath(path: string): string {
    path = this.cleanNotRecursivePath(path);
    if (path.charAt(0) === this.options.delimeter) {
      return path.substr(1);
    }
    return path;
  }

  split(path: string) {
    return path === "" ? [] : path.split(this.options.delimeter);
  }

  isWildcard(path: string): boolean {
    return path.includes(this.options.wildcard);
  }

  isNotRecursive(path: string): boolean {
    return path.endsWith(this.options.notRecursive);
  }

  cleanNotRecursivePath(path: string): string {
    return this.isNotRecursive(path)
      ? path.substring(0, path.length - 1)
      : path;
  }

  hasParams(path: string) {
    return path.includes(this.options.param);
  }

  getParamsInfo(path: string): ParamsInfo {
    let paramsInfo: ParamsInfo = { replaced: "", original: path, params: {} };
    let partIndex = 0;
    let fullReplaced = [];
    for (const part of this.split(path)) {
      paramsInfo.params[partIndex] = {
        original: part,
        replaced: "",
        name: ""
      };
      const reg = new RegExp(
        `\\${this.options.param}([^\\${this.options.delimeter}\\${this.options.param}]+)`,
        "g"
      );
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
      paramsInfo.params[partIndex].replaced = part.replace(
        reg,
        this.options.wildcard
      );
      fullReplaced.push(paramsInfo.params[partIndex].replaced);
      partIndex++;
    }
    paramsInfo.replaced = fullReplaced.join(this.options.delimeter);
    return paramsInfo;
  }

  getParams(paramsInfo: ParamsInfo | undefined, path: string): Params {
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

  waitForAll(
    userPath: string[],
    fn: ListenerFunction,
    options: ListenerOptions = defaultListenerOptions
  ) {}

  subscribeAll(
    userPaths: string[],
    fn: ListenerFunction,
    options: ListenerOptions = defaultListenerOptions
  ) {
    if (options.waitForAll) {
      return this.waitForAll(userPaths, fn, options);
    }
    let unsubscribers = [];
    for (const userPath of userPaths) {
      unsubscribers.push(this.subscribe(userPath, fn, options));
    }
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      unsubscribers = [];
    };
  }

  getCleanListenersCollection(values = {}): ListenersCollection {
    return {
      listeners: new Map(),
      isRecursive: false,
      isWildcard: false,
      hasParams: false,
      match: undefined,
      paramsInfo: undefined,
      path: undefined,
      count: 0,
      ...values
    };
  }

  getCleanListener(
    fn: ListenerFunction,
    options: ListenerOptions = defaultListenerOptions
  ): Listener {
    return {
      fn,
      options: { ...defaultListenerOptions, ...options }
    };
  }

  getListenerCollectionMatch(
    listenerPath: string,
    isRecursive: boolean,
    isWildcard: boolean
  ) {
    listenerPath = this.cleanNotRecursivePath(listenerPath);
    const self = this;
    return function listenerCollectionMatch(path) {
      if (isRecursive) path = self.cutPath(path, listenerPath);
      if (isWildcard && self.match(listenerPath, path)) return true;
      return listenerPath === path;
    };
  }

  getListenersCollection(
    listenerPath: string,
    listener: Listener
  ): ListenersCollection {
    if (this.listeners.has(listenerPath)) {
      let listenersCollection = this.listeners.get(listenerPath);
      this.id++;
      listenersCollection.listeners.set(this.id, listener);
      return listenersCollection;
    }
    let collCfg = {
      isRecursive: true,
      isWildcard: false,
      hasParams: false,
      paramsInfo: undefined,
      originalPath: listenerPath,
      path: listenerPath
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
      match: this.getListenerCollectionMatch(
        collCfg.path,
        collCfg.isRecursive,
        collCfg.isWildcard
      )
    });
    this.id++;
    listenersCollection.listeners.set(this.id, listener);
    this.listeners.set(collCfg.path, listenersCollection);
    return listenersCollection;
  }

  subscribe(
    listenerPath: string,
    fn: ListenerFunction,
    options: ListenerOptions = defaultListenerOptions,
    type: string = "subscribe"
  ) {
    let listener = this.getCleanListener(fn, options);
    const listenersCollection = this.getListenersCollection(
      listenerPath,
      listener
    );
    listenersCollection.count++;
    listenerPath = listenersCollection.path;
    if (!listenersCollection.isWildcard) {
      fn(
        this.pathGet(
          this.split(this.cleanNotRecursivePath(listenerPath)),
          this.data
        ),
        {
          type,
          listener,
          listenersCollection,
          path: {
            listener: listenerPath,
            update: undefined,
            resolved: this.cleanNotRecursivePath(listenerPath)
          },
          params: this.getParams(listenersCollection.paramsInfo, listenerPath),
          options
        }
      );
    } else {
      const paths = this.scan.get(this.cleanNotRecursivePath(listenerPath));
      if (options.bulk) {
        const bulkValue = [];
        for (const path in paths) {
          bulkValue.push({
            path,
            params: this.getParams(listenersCollection.paramsInfo, path),
            value: paths[path]
          });
        }
        fn(bulkValue, {
          type,
          listener,
          listenersCollection,
          path: {
            listener: listenerPath,
            update: undefined,
            resolved: undefined
          },
          options,
          params: undefined
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
              resolved: this.cleanNotRecursivePath(path)
            },
            params: this.getParams(listenersCollection.paramsInfo, path),
            options
          });
        }
      }
    }
    this.debugSubscribe(listener, listenersCollection, listenerPath);
    return this.unsubscribe(listenerPath, this.id);
  }

  unsubscribe(path: string, id: number) {
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

  same(newValue, oldValue): boolean {
    return (
      (["number", "string", "undefined", "boolean"].includes(typeof newValue) ||
        newValue === null) &&
      oldValue === newValue
    );
  }

  notifyListeners(
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
        singleListener.listener.fn(
          singleListener.value(),
          singleListener.eventInfo
        );
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
        bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
        if (returnNotified) alreadyNotified.push(bulkListener);
        this.debugListener(time, bulkListener);
      }
    }
    return alreadyNotified;
  }

  getSubscribedListeners(
    updatePath: string,
    newValue,
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
        const value =
          listenersCollection.isRecursive || listenersCollection.isWildcard
            ? () => this.get(this.cutPath(updatePath, listenerPath))
            : () => newValue;
        const bulkValue = [{ value, path: updatePath, params }];
        for (const listener of listenersCollection.listeners.values()) {
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
                  resolved: undefined
                },
                params,
                options
              },
              value: bulkValue
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
                  resolved: this.cleanNotRecursivePath(updatePath)
                },
                params,
                options
              },
              value
            });
          }
        }
      }
    }
    return listeners;
  }

  notifySubscribedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListener[] {
    return this.notifyListeners(
      this.getSubscribedListeners(
        updatePath,
        newValue,
        options,
        type,
        originalPath
      )
    );
  }

  getNestedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners {
    const listeners: GroupedListeners = {};
    for (let [listenerPath, listenersCollection] of this.listeners) {
      listeners[listenerPath] = { single: [], bulk: [] };
      const currentCuttedPath = this.cutPath(listenerPath, updatePath);
      if (this.match(currentCuttedPath, updatePath)) {
        const restPath = this.trimPath(
          listenerPath.substr(currentCuttedPath.length)
        );
        const values = new WildcardObject(
          newValue,
          this.options.delimeter,
          this.options.wildcard
        ).get(restPath);
        const params = listenersCollection.paramsInfo
          ? this.getParams(listenersCollection.paramsInfo, updatePath)
          : undefined;
        const bulk = [];
        const bulkListeners = {};
        for (const currentRestPath in values) {
          const value = () => values[currentRestPath];
          const fullPath = [updatePath, currentRestPath].join(
            this.options.delimeter
          );
          for (const [listenerId, listener] of listenersCollection.listeners) {
            const eventInfo = {
              type,
              listener,
              listenersCollection,
              path: {
                listener: listenerPath,
                update: originalPath ? originalPath : updatePath,
                resolved: this.cleanNotRecursivePath(fullPath)
              },
              params,
              options
            };
            if (listener.options.bulk) {
              bulk.push({ value, path: fullPath, params });
              bulkListeners[listenerId] = listener;
            } else {
              listeners[listenerPath].single.push({
                listener,
                listenersCollection,
                eventInfo,
                value
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
              resolved: undefined
            },
            options,
            params
          };
          listeners[listenerPath].bulk.push({
            listener,
            listenersCollection,
            eventInfo,
            value: bulk
          });
        }
      }
    }
    return listeners;
  }

  notifyNestedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    alreadyNotified: GroupedListener[],
    originalPath: string = null
  ) {
    return this.notifyListeners(
      this.getNestedListeners(
        updatePath,
        newValue,
        options,
        type,
        originalPath
      ),
      alreadyNotified,
      false
    );
  }

  getNotifyOnlyListeners(
    updatePath: string,
    newValue,
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
      const wildcardScan = new WildcardObject(
        newValue,
        this.options.delimeter,
        this.options.wildcard
      ).get(notifyPath);
      listeners[notifyPath] = { bulk: [], single: [] };
      for (const wildcardPath in wildcardScan) {
        const fullPath = updatePath + this.options.delimeter + wildcardPath;
        for (const [listenerPath, listenersCollection] of this.listeners) {
          const params = listenersCollection.paramsInfo
            ? this.getParams(listenersCollection.paramsInfo, fullPath)
            : undefined;
          if (this.match(listenerPath, fullPath)) {
            const value = () => wildcardScan[wildcardPath];
            const bulkValue = [{ value, path: fullPath, params }];
            for (const listener of listenersCollection.listeners.values()) {
              const eventInfo = {
                type,
                listener,
                listenersCollection,
                path: {
                  listener: listenerPath,
                  update: originalPath ? originalPath : updatePath,
                  resolved: this.cleanNotRecursivePath(fullPath)
                },
                params,
                options
              };
              if (listener.options.bulk) {
                if (
                  !listeners[notifyPath].bulk.some(
                    bulkListener => bulkListener.listener === listener
                  )
                ) {
                  listeners[notifyPath].bulk.push({
                    listener,
                    listenersCollection,
                    eventInfo,
                    value: bulkValue
                  });
                }
              } else {
                listeners[notifyPath].single.push({
                  listener,
                  listenersCollection,
                  eventInfo,
                  value
                });
              }
            }
          }
        }
      }
    }
    return listeners;
  }

  notifyOnly(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = ""
  ): boolean {
    return (
      typeof this.notifyListeners(
        this.getNotifyOnlyListeners(
          updatePath,
          newValue,
          options,
          type,
          originalPath
        )
      )[0] !== "undefined"
    );
  }

  canBeNested(newValue): boolean {
    return typeof newValue === "object" && newValue !== null;
  }

  getUpdateValues(oldValue, split, fn) {
    if (typeof oldValue === "object" && oldValue !== null) {
      Array.isArray(oldValue)
        ? (oldValue = oldValue.slice())
        : (oldValue = { ...oldValue });
    }
    let newValue = fn;
    if (typeof fn === "function") {
      newValue = fn(this.pathGet(split, this.data));
    }
    return { newValue, oldValue };
  }

  wildcardUpdate(
    updatePath: string,
    fn: Updater,
    options: UpdateOptions = defaultUpdateOptions
  ) {
    options = { ...defaultUpdateOptions, ...options };
    const scanned = this.scan.get(updatePath);
    const bulk = {};
    for (const path in scanned) {
      const split = this.split(path);
      const { oldValue, newValue } = this.getUpdateValues(
        scanned[path],
        split,
        fn
      );
      if (!this.same(newValue, oldValue)) bulk[path] = newValue;
    }
    const groupedListenersPack = [];
    for (const path in bulk) {
      const newValue = bulk[path];
      if (options.only.length) {
        groupedListenersPack.push(
          this.getNotifyOnlyListeners(
            path,
            newValue,
            options,
            "update",
            updatePath
          )
        );
      } else {
        groupedListenersPack.push(
          this.getSubscribedListeners(
            path,
            newValue,
            options,
            "update",
            updatePath
          )
        );
        this.canBeNested(newValue) &&
          groupedListenersPack.push(
            this.getNestedListeners(
              path,
              newValue,
              options,
              "update",
              updatePath
            )
          );
      }
      options.debug && this.options.log("Wildcard update", { path, newValue });
      this.pathSet(this.split(path), newValue, this.data);
    }
    let alreadyNotified = [];
    for (const groupedListeners of groupedListenersPack) {
      alreadyNotified = [
        ...alreadyNotified,
        ...this.notifyListeners(groupedListeners, alreadyNotified)
      ];
    }
  }

  update(
    updatePath: string,
    fn: Updater,
    options: UpdateOptions = defaultUpdateOptions
  ) {
    if (this.isWildcard(updatePath)) {
      return this.wildcardUpdate(updatePath, fn, options);
    }
    const split = this.split(updatePath);
    const { oldValue, newValue } = this.getUpdateValues(
      this.pathGet(split, this.data),
      split,
      fn
    );
    if (options.debug) {
      this.options.log(
        `Updating ${updatePath} ${
          options.source ? `from ${options.source}` : ""
        }`,
        { oldValue, newValue }
      );
    }
    if (this.same(newValue, oldValue)) {
      return newValue;
    }
    this.pathSet(split, newValue, this.data);
    options = { ...defaultUpdateOptions, ...options };
    if (options.only === null) {
      return newValue;
    }
    if (options.only.length) {
      this.notifyOnly(updatePath, newValue, options);
      return newValue;
    }
    const alreadyNotified = this.notifySubscribedListeners(
      updatePath,
      newValue,
      options
    );
    if (this.canBeNested(newValue)) {
      this.notifyNestedListeners(
        updatePath,
        newValue,
        options,
        "update",
        alreadyNotified
      );
    }
    return newValue;
  }

  get(userPath: string | undefined = undefined) {
    if (typeof userPath === "undefined" || userPath === "") {
      return this.data;
    }
    return this.pathGet(this.split(userPath), this.data);
  }

  debugSubscribe(
    listener: Listener,
    listenersCollection: ListenersCollection,
    listenerPath: string
  ) {
    if (listener.options.debug) {
      this.options.log("listener subscribed", {
        listenerPath,
        listener,
        listenersCollection
      });
    }
  }

  debugListener(time: number, groupedListener: GroupedListener) {
    if (
      groupedListener.eventInfo.options.debug ||
      groupedListener.listener.options.debug
    ) {
      this.options.log("Listener fired", {
        time: Date.now() - time,
        info: groupedListener
      });
    }
  }

  debugTime(groupedListener: GroupedListener): number {
    return groupedListener.listener.options.debug ||
      groupedListener.eventInfo.options.debug
      ? Date.now()
      : 0;
  }
}
export default DeepState;
export const State = DeepState;
