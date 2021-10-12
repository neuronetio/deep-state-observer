import WildcardObject from "./wildcard-object-scan";
import Path from "./ObjectPath";
import init, { is_match } from "./wildcard_matcher.js";

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
export type Match = (path: string, debug?: boolean) => boolean;

export interface Options {
  delimiter?: string;
  useMute?: boolean;
  notRecursive?: string;
  param?: string;
  wildcard?: string;
  experimentalMatch?: boolean;
  useObjectMaps?: boolean;
  useProxy?: boolean;
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

export interface Listener {
  fn: ListenerFunction;
  options: ListenerOptions;
  id?: number;
  groupId: number | null;
}

export interface Queue {
  id: number;
  resolvedPath: string;
  resolvedIdPath: string;
  fn: () => void;
  originalFn: ListenerFunction;
  options: ListenerOptions;
  groupId: number;
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
  originalPath: string;
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
function isObject(item: any) {
  if (item && item.constructor) {
    return item.constructor.name === "Object";
  }
  return typeof item === "object" && item !== null;
}

export interface UnknownObject {
  [key: string]: unknown;
}

export interface ProxyNode {
  [key: string]: unknown;
  [n: number]: unknown;
  ___deep_state_observer___: ProxyData;
}

export interface ProxyData {
  path: string;
  pathChunks: string[];
  saving: (string | number)[];
  parent: ProxyNode | null;
  mapOnly?: boolean;
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
    useObjectMaps: true,
    useProxy: false,
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

class DeepState {
  private listeners: Listeners;
  private data: object;
  private options: Options;
  private id: number;
  private scan: any;
  private subscribeQueue = [];
  private listenersIgnoreCache: WeakMap<Listener, { truthy: string[]; falsy: string[] }> = new WeakMap();
  private is_match: any = null;
  private destroyed = false;
  private resolved: Promise<unknown> | any;
  private muted: Set<string>;
  private mutedListeners: Set<ListenerFunction>;
  private groupId: number = 0;
  private traceId: number = 0;
  // private pathGet: any;
  // private pathSet: any;
  private traceMap: Map<string, TraceValue> = new Map();
  private tracing: string[] = [];
  private savedTrace: TraceValue[] = [];
  private collection: Multi = null;
  private collections: number = 0;
  public readonly proxyProperty = "___deep_state_observer___";
  private rootProxyNode: ProxyNode = {
    ___deep_state_observer___: {
      path: "___deep_state_observer___",
      pathChunks: ["___deep_state_observer___"],
      saving: [],
      parent: null,
    },
  };

  private handler = {
    set: (obj: ProxyNode, prop, value, proxy) => {
      if (prop === this.proxyProperty) return true;
      if (prop in obj && (this.same(obj[prop], value) || (this.isProxy(value) && obj[prop] === value))) {
        return true;
      }
      if (!obj[this.proxyProperty].saving.includes(prop)) {
        // we are not fired this from update
        // change from proxy
        const path = obj[this.proxyProperty].path ? obj[this.proxyProperty].path + this.options.delimiter + prop : prop;
        // check if any parent property is currently saving this node - if yes we are not going to notify
        if (!this.isSaving(obj[this.proxyProperty].pathChunks, obj)) {
          this.update(path, value); // fire update to notify listeners and set isSaving
        } else {
          // if parent node is saving current node and in meanwhile someone updates nodes below - just update it - do not notify
          // we are not generating new map because update fn will do it for us on final object
          // we cannot check if values are the same from pathGet because pathGet is using maps and map is generated before obj because it will make value observable
          if (isObject(value) || Array.isArray(value)) {
            value = this.makeObservable(value, path, obj);
          }
          obj[prop] = value;
        }
      } else {
        // change from update
        obj[prop] = value;
      }
      return true;
    },

    deleteProperty: (obj: ProxyNode, prop) => {
      if (!(prop in obj)) return false;
      // delete property comes only from proxy
      const parentPath = obj[this.proxyProperty].path;
      delete obj[prop];
      this.update(parentPath, (currentValue) => {
        // only notification because value is already deleted
        return currentValue;
      });
      return true;
    },
  };

  private objectMapOnlyHandler = {
    set: (obj: any, prop, value) => {
      if (prop === this.proxyProperty) return true;
      if (prop in obj && (this.same(obj[prop], value) || (this.isProxy(value) && obj[prop] === value))) {
        return true;
      }
      const path = obj[this.proxyProperty].path ? obj[this.proxyProperty].path + this.options.delimiter + prop : prop;
      if (!this.isSaving(this.split(path), obj)) {
        obj[prop] = this.updateMapDown(path, value, obj);
      } else {
        obj[prop] = value;
      }
      return true;
    },
    deleteProperty: (obj: any, prop) => {
      if (!(prop in obj)) return false;
      const path = obj[this.proxyProperty].path ? obj[this.proxyProperty].path + this.options.delimiter + prop : prop;
      this.deleteFromMap(path);
      // here we only deleting - we don't fire update because we are not using proxy observable
      // just object actualization
      delete obj[prop];
      return true;
    },
  };
  public proxy: object;
  /**
   * @property $$$ proxy shorthand
   */
  public $$$: object;
  private map: Map<string, any> = new Map();

  constructor(data: object = {}, options: Options = {}) {
    this.listeners = new Map();
    this.options = { ...getDefaultOptions(), ...options };

    if (this.options.useObjectMaps) {
      // updateMapDown will check if we are using proxy or not
      this.setNodeSaving(this.rootProxyNode, "");
      this.data = this.updateMapDown("", data, this.rootProxyNode, false);
      this.unsetNodeSaving(this.rootProxyNode, "");
    } else if (this.options.useProxy) {
      this.data = this.makeObservable(data, "", this.rootProxyNode);
    }
    if (!this.options.useObjectMaps && !this.options.useProxy) {
      this.data = data;
    }
    this.proxy = this.data;
    this.$$$ = this.proxy;

    this.id = 0;
    if (!this.options.useObjectMaps) {
      this.pathGet = (path: string) => {
        return Path.get(this.split(path), this.data);
      };
      this.pathSet = (pathChunks: string[], value: any) => {
        return Path.set(pathChunks, value, this.data);
      };
    }
    if (options.Promise) {
      this.resolved = options.Promise.resolve();
    } else {
      this.resolved = Promise.resolve();
    }
    this.muted = new Set();
    this.mutedListeners = new Set();
    if (this.options.useObjectMaps) {
      this.scan = new WildcardObject(this.data, this.options.delimiter, this.options.wildcard, this.map);
    } else {
      this.scan = new WildcardObject(this.data, this.options.delimiter, this.options.wildcard);
    }
    this.destroyed = false;
  }

  private deleteFromMap(fullPath: string, map = this.map) {
    for (const key of map.keys()) {
      if (key.startsWith(fullPath)) map.delete(key);
    }
  }

  private updateMapDown(fullPath: string, value: any, parent: ProxyNode, deleteReferences = true, map = this.map) {
    if (!this.options.useObjectMaps) return value;
    if (deleteReferences) {
      this.deleteFromMap(fullPath);
    }
    if (isObject(value)) {
      value = this.makeObservable(value, fullPath, parent);
      for (const prop in value) {
        if (prop === this.proxyProperty) continue;
        if (this.isProxy(parent) && this.options.useProxy) this.setNodeSaving(value, prop);
        const valuePropWithProxy = this.updateMapDown(
          fullPath ? fullPath + this.options.delimiter + prop : prop,
          value[prop],
          value,
          false,
          map
        );
        value[prop] = valuePropWithProxy;
        if (this.isProxy(parent) && this.options.useProxy) this.unsetNodeSaving(value, prop);
      }
    } else if (Array.isArray(value)) {
      value = this.makeObservable(value, fullPath, parent);
      for (let i = 0, len = value.length; i < len; i++) {
        if (this.isProxy(parent) && this.options.useProxy) this.setNodeSaving(value, i);
        const valueWithProxy = this.updateMapDown(
          fullPath ? fullPath + this.options.delimiter + String(i) : String(i),
          value[i],
          value as unknown as ProxyNode,
          false,
          map
        );
        value[i] = valueWithProxy;
        if (this.isProxy(parent) && this.options.useProxy) this.unsetNodeSaving(value, i);
      }
    }
    map.set(fullPath, value);
    return value;
  }

  private pathGet(path: string) {
    if (!this.options.useObjectMaps) return Path.get(this.split(path), this.data);
    if (!path) return this.data;
    return this.map.get(path);
  }

  private pathSet(pathChunks: string[], value: any) {
    if (!this.options.useObjectMaps) return Path.set(pathChunks, value, this.data);
    let prop,
      currentPath = "",
      obj = this.data;
    if (!Array.isArray(pathChunks)) throw new Error("Invalid path chunks");
    const chunks = pathChunks.slice();
    let last = "";
    if (chunks.length) {
      last = chunks.pop();
    }
    let referencesDeleted = false;
    const removeSavings = [];
    // create nodes if needed
    for (let i = 0, len = chunks.length; i < len; i++) {
      prop = chunks[i];
      if (currentPath) {
        currentPath += this.options.delimiter + prop;
      } else {
        currentPath = prop;
      }
      if (prop in obj) {
        obj = obj[prop];
        continue;
      }
      // property doesn't exists
      obj[prop] = this.makeObservable(Object.create(null), currentPath, obj as ProxyNode);
      this.setNodeSaving(obj[prop], pathChunks[i + 1]); // do not notify anything now
      removeSavings.push([obj[prop], pathChunks[i + 1]]);
      if (!referencesDeleted) {
        this.deleteFromMap(currentPath);
        referencesDeleted = true;
      }
      this.map.set(currentPath, obj[prop]);
      obj = obj[prop];
    }
    if (currentPath) {
      currentPath += this.options.delimiter + last;
    } else {
      currentPath = last;
    }
    // update down if needed
    let parent;
    if (!currentPath) {
      parent = this.rootProxyNode;
    } else {
      parent = obj;
    }

    if (this.options.useProxy) {
      // NOTICE: we are using objectMaps because this method is fired otherwise it is replaced by object traverse pathSet
      // if not using proxy objectMaps will update map down inside handler
      value = this.updateMapDown(currentPath, value, parent as ProxyNode, !referencesDeleted);
    }
    if (last) {
      this.setNodeSaving(parent, last);
      obj[last] = value;
      this.unsetNodeSaving(parent, last);
    } else {
      if (!isObject(value) && !Array.isArray(value)) {
        console.error("The state root node should be an object.", value);
        return;
      }
      if (isObject(value)) {
        for (const key in value) {
          this.setNodeSaving(parent, key);
          obj[key] = value[key];
          this.unsetNodeSaving(parent, key);
        }
      } else {
        for (let i = 0, len = value.length; i < len; i++) {
          this.setNodeSaving(parent, i);
          obj[i] = value[i];
          this.unsetNodeSaving(parent, i);
        }
      }
    }
    for (const [obj, prop] of removeSavings) {
      this.unsetNodeSaving(obj, prop);
    }
  }

  private getParent(pathChunks: string[], proxyNode: ProxyNode | any): ProxyNode | null {
    if (!this.options.useProxy) {
      const split = pathChunks.slice();
      split.pop();
      return this.get(this.trimPath(split.join(this.options.delimiter)));
    }
    if (proxyNode && typeof proxyNode[this.proxyProperty] !== "undefined") return proxyNode[this.proxyProperty].parent;
    if (pathChunks.length === 0) return this.rootProxyNode;
    const split = pathChunks.slice();
    split.pop();
    return this.get(this.trimPath(split.join(this.options.delimiter)));
  }

  private isSaving(pathChunks: string[], proxyNode: ProxyNode | any) {
    if (!this.options.useProxy) return;
    let parent = this.getParent(pathChunks, proxyNode);
    if (parent && this.isProxy(parent)) {
      if (parent[this.proxyProperty].saving.includes(pathChunks[pathChunks.length - 1])) return true;
      return this.isSaving(parent[this.proxyProperty].pathChunks, parent);
    }
    return false;
  }

  private setNodeSaving(proxyNode: ProxyNode, prop: string | number) {
    if (!this.options.useProxy) return;
    if (!this.isProxy(proxyNode)) {
      console.trace("It's not a proxy, but it should be.", proxyNode, prop);
      return;
    }
    proxyNode[this.proxyProperty].saving.push(prop);
  }

  private unsetNodeSaving(proxyNode: ProxyNode, prop: string | number) {
    if (!this.options.useProxy) return;
    const saving = [];
    for (const currentProp of proxyNode[this.proxyProperty].saving) {
      if (currentProp !== prop) saving.push(currentProp);
    }
    if (!this.isProxy(proxyNode)) {
      console.trace("It's not a proxy, but it should be.", proxyNode, prop);
      return;
    }
    proxyNode[this.proxyProperty].saving = saving;
  }

  private addSaving(pathChunks: string[], proxyNode: ProxyNode | any) {
    if (!this.options.useProxy) return;
    const parent = this.getParent(pathChunks, proxyNode);
    const changedProp = pathChunks[pathChunks.length - 1];
    if (parent) this.setNodeSaving(parent, changedProp);
  }

  private removeSaving(pathChunks: string[], proxyNode: ProxyNode | any) {
    if (!this.options.useProxy) return;
    const parent = this.getParent(pathChunks, proxyNode);
    if (parent) {
      const changedProp = pathChunks[pathChunks.length - 1];
      this.unsetNodeSaving(parent, changedProp);
    }
  }

  private setProxy(target: any, data: ProxyData) {
    if (!this.options.useProxy) return target;
    if (typeof target[this.proxyProperty] === "undefined") {
      Object.defineProperty(target, this.proxyProperty, {
        enumerable: false,
        writable: false,
        configurable: false,
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

  private setProxyForMapOnly(target: any, data: ProxyData) {
    if (!this.options.useObjectMaps) return target;
    if (typeof target[this.proxyProperty] === "undefined") {
      data.mapOnly = true;
      Object.defineProperty(target, this.proxyProperty, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: data,
      });
      return new Proxy(target, this.objectMapOnlyHandler);
    } else {
      for (const key in data) {
        target[this.proxyProperty][key] = data[key];
      }
    }
    return target;
  }

  private isProxy(target: any) {
    return target && typeof target[this.proxyProperty] !== "undefined";
  }

  private makeObservable(target: any, path: string, parent: ProxyNode) {
    if (!this.options.useProxy && this.options.useObjectMaps) return this.makeProxyForMapOnly(target, path, parent);
    if (!this.options.useProxy) return target;
    if (isObject(target) || Array.isArray(target)) {
      if (typeof target[this.proxyProperty] !== "undefined") {
        const pp = target[this.proxyProperty];
        if (pp.path === path && pp.parent === parent) return target;
      }
      if (isObject(target)) {
        for (const key in target) {
          if (key === this.proxyProperty) continue;
          if ((isObject(target[key]) || Array.isArray(target[key])) && !this.isProxy(target[key])) {
            if (this.isProxy(target)) this.setNodeSaving(target, key);
            target[key] = this.makeObservable(
              target[key],
              `${path ? path + this.options.delimiter : ""}${key}`,
              target
            );
            if (this.isProxy(target)) this.unsetNodeSaving(target, key);
          }
        }
      } else {
        for (let key = 0, len = target.length; key < len; key++) {
          if ((isObject(target[key]) || Array.isArray(target[key])) && !this.isProxy(target[key])) {
            if (this.isProxy(target)) this.setNodeSaving(target, String(key));
            target[key] = this.makeObservable(
              target[key],
              `${path ? path + this.options.delimiter : ""}${key}`,
              target
            );
            if (this.isProxy(target)) this.unsetNodeSaving(target, String(key));
          }
        }
      }
      if (!this.isProxy(target)) {
        const proxyObj: ProxyData = Object.create(null);
        proxyObj.path = path;
        proxyObj.pathChunks = this.split(path);
        proxyObj.saving = [];
        proxyObj.parent = parent;
        target = this.setProxy(target, proxyObj);
      }
    }
    return target;
  }

  private makeProxyForMapOnly(target: any, path: string, parent: ProxyNode) {
    if (!this.options.useObjectMaps) return target;
    if (isObject(target) || Array.isArray(target)) {
      if (typeof target[this.proxyProperty] !== "undefined") {
        const pp = target[this.proxyProperty];
        if (pp.path === path && pp.parent === parent) return target;
      }
      if (isObject(target)) {
        for (const key in target) {
          if (key === this.proxyProperty) continue;
          if ((isObject(target[key]) || Array.isArray(target[key])) && !this.isProxy(target[key])) {
            target[key] = this.makeProxyForMapOnly(
              target[key],
              `${path ? path + this.options.delimiter : ""}${key}`,
              target
            );
          }
        }
      } else {
        for (let key = 0, len = target.length; key < len; key++) {
          if ((isObject(target[key]) || Array.isArray(target[key])) && !this.isProxy(target[key])) {
            target[key] = this.makeProxyForMapOnly(
              target[key],
              `${path ? path + this.options.delimiter : ""}${key}`,
              target
            );
          }
        }
      }
      if (!this.isProxy(target)) {
        const proxyObj: ProxyData = Object.create(null);
        proxyObj.path = path;
        proxyObj.pathChunks = this.split(path);
        proxyObj.saving = [];
        proxyObj.parent = parent;
        target = this.setProxyForMapOnly(target, proxyObj);
      }
    }
    return target;
  }

  public async loadWasmMatcher(pathToWasmFile: string) {
    await init(pathToWasmFile);
    this.is_match = is_match;
    this.scan = new WildcardObject(
      this.data,
      this.options.delimiter,
      this.options.wildcard,
      this.options.useObjectMaps ? this.map : null,
      this.is_match
    );
  }

  private same(newValue, oldValue): boolean {
    return (
      (["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
      oldValue === newValue
    );
  }

  public getListeners(): Listeners {
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

  public subscribeAll(userPaths: string[], fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions) {
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

  private getCleanListenersCollection(values = {}): ListenersCollection {
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

  private getCleanListener(fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions): Listener {
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

  private getListenersCollection(listenerPath: string, listener: Listener): ListenersCollection {
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

  public subscribe(
    listenerPath: string,
    fn: ListenerFunction,
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
      console.log("[subscribe]", { listenerPath, options });
    }
    listenersCollection.count++;
    if (!options.group || (options.group && subscribeAllOptions.all.length - 1 === subscribeAllOptions.index)) {
      const cleanPath = this.cleanNotRecursivePath(listenersCollection.path);
      if (!listenersCollection.isWildcard) {
        if (!this.isMuted(cleanPath) && !this.isMuted(fn)) {
          fn(this.pathGet(cleanPath), {
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

  private getQueueNotifyListeners(groupedListeners: GroupedListeners, queue: Queue[] = []): Queue[] {
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

  private shouldIgnore(listener: Listener, updatePath: string): boolean {
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
  ): Queue[] {
    return this.getQueueNotifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
  }

  private getNestedListeners(
    updatePath: string,
    newValue,
    options: UpdateOptions,
    type: string = "update",
    originalPath: string = null
  ): GroupedListeners {
    const listeners: GroupedListeners = {};
    const restBelowValues = {};
    for (let [listenerPath, listenersCollection] of this.listeners) {
      if (!listenersCollection.isRecursive) continue;
      listeners[listenerPath] = { single: [], bulk: [] };
      // listenerPath is longer and is shortened - because we want to get listeners underneath change
      const currentAbovePathCut = this.cutPath(listenerPath, updatePath);
      if (this.match(currentAbovePathCut, updatePath)) {
        // listener is listening below updated node
        const restBelowPathCut = this.trimPath(listenerPath.substr(currentAbovePathCut.length));
        const wildcardNewValues = restBelowValues[restBelowPathCut]
          ? restBelowValues[restBelowPathCut] // if those values are already calculated use it
          : new WildcardObject(newValue, this.options.delimiter, this.options.wildcard).get(restBelowPathCut);

        restBelowValues[restBelowPathCut] = wildcardNewValues;
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
              currentCutPath: currentAbovePathCut,
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
    queue: Queue[],
    originalPath: string = null
  ): Queue[] {
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

  private runQueue(queue: Queue[]) {
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

  private sortAndRunQueue(queue: Queue[], path: string) {
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

  private getUpdateValues(oldValue, split, fn, parent: ProxyNode) {
    let newValue = fn;
    if (typeof fn === "function") {
      newValue = fn(oldValue);
    }
    if (this.options.useProxy) {
      if (isObject(newValue) || Array.isArray(newValue))
        newValue = this.makeObservable(newValue, split.join(this.options.delimiter), parent);
    }
    // here we don't want to update maps if only maps are enabled because PathSet will update everything for us
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
      const parent = this.getParent(split, scanned[path]);
      this.addSaving(split, scanned[path]);
      const { oldValue, newValue } = this.getUpdateValues(scanned[path], split, fn, parent);
      if (!this.same(newValue, oldValue) || options.force) {
        this.pathSet(split, newValue);
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
          self.removeSaving(self.split(path), scanned[path]);
        }
      };
    }
    const queue = this.wildcardNotify(groupedListenersPack);
    this.sortAndRunQueue(queue, updatePath);
    for (const path in scanned) {
      this.removeSaving(this.split(path), scanned[path]);
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
    const currentValue = this.pathGet(updatePath);
    const currentlySaving = this.isSaving(split, currentValue);
    this.addSaving(split, currentValue);
    const parent = this.getParent(split, currentValue);
    let { oldValue, newValue } = this.getUpdateValues(currentValue, split, fnOrValue, parent);
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

    this.pathSet(split, newValue);

    // if we are saving a parent node - do not notify about changes
    // because someone may modify object which is given as argument
    // and will fire subscriptions immediately which is not intended
    if (this.options.useProxy && currentlySaving && !options.force) {
      this.removeSaving(split, newValue);
      return newValue;
    }

    options = { ...defaultUpdateOptions, ...options };
    if (options.only === null) {
      if (multi) return function () {};
      this.removeSaving(split, newValue);
      return newValue;
    }
    if (options.only.length) {
      if (multi) {
        const self = this;
        return function () {
          const result = self.updateNotifyOnly(updatePath, newValue, options);
          self.removeSaving(split, newValue);
          return result;
        };
      }
      this.updateNotifyOnly(updatePath, newValue, options);
      this.removeSaving(split, newValue);
      return newValue;
    }
    if (multi) {
      const self = this;
      return function multiUpdate() {
        const result = self.updateNotify(updatePath, newValue, options);
        self.removeSaving(split, newValue);
        return result;
      };
    }
    this.updateNotify(updatePath, newValue, options);
    this.removeSaving(split, newValue);
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
          const currentValue = self.pathGet(updatePath);
          self.addSaving(split, currentValue);
          if (typeof value === "function") {
            value = value(currentValue);
          }
          if (self.options.useProxy) {
            if (isObject(value) || Array.isArray(value)) {
              const parent = self.getParent(split, currentValue);
              value = self.makeObservable(value, updatePath, parent);
            }
          }
          self.pathSet(split, value);
          self.removeSaving(split, currentValue);
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

  public get(userPath: string) {
    if (this.destroyed) return;
    if (typeof userPath === "undefined" || userPath === "") {
      return this.data;
    }
    return this.pathGet(userPath as string);
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

  public isMuted(pathOrListenerFunction: string | ListenerFunction): boolean {
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

  public isMutedListener(listenerFunc: ListenerFunction): boolean {
    return this.mutedListeners.has(listenerFunc);
  }

  public mute(pathOrListenerFunction: string | ListenerFunction) {
    if (typeof pathOrListenerFunction === "function") {
      return this.mutedListeners.add(pathOrListenerFunction);
    }
    this.muted.add(pathOrListenerFunction);
  }

  public unmute(pathOrListenerFunction: string | ListenerFunction) {
    if (typeof pathOrListenerFunction === "function") {
      return this.mutedListeners.delete(pathOrListenerFunction);
    }
    this.muted.delete(pathOrListenerFunction);
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
