import { path, set, view, lensPath } from 'ramda';
import wildcard from './wildcard-object-scan';

export type ListenerFunction = (value: any, path: string, params: any) => {};
export type Match = (path: string) => boolean;

export interface Options {
  delimeter: string;
  recursive: string;
  param: string;
  useCache: boolean;
}

export interface ListenerOptions {
  bulk: boolean;
  debug: boolean;
}

export interface Listener {
  fn: ListenerFunction;
  options: ListenerOptions;
}

export type Updater = (value: any) => {};

export interface ListenersCollection {
  path: string;
  listeners: Listener[];
  isWildcard: boolean;
  isRecursive: boolean;
  hasParams: boolean;
  paramsInfo: ParamsInfo | undefined;
  match: Match;
}

export interface Listeners {
  [path: string]: ListenersCollection;
}

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

export interface CacheValue {
  match: boolean;
  params: Params | undefined;
}

export interface Cache {
  [comparedWith: string]: CacheValue;
}

export interface CacheCollection {
  [listenerPath: string]: Cache;
}

export interface UpdateOptions {
  only: string[];
}

export type CacheGetResult = CacheValue | any;

export interface CacheCollectionApi {
  get: (key: string, secondKey: string) => CacheGetResult;
  has: (key: string, secondKey: string) => boolean;
  set: (key: string, secondKey: string, value: CacheValue) => CacheValue;
  delete: (key: string, secondKey: string | undefined) => any;
}

export const scanObject = wildcard.scanObject;
export const match = wildcard.match;

const defaultOptions: Options = { delimeter: '.', recursive: '...', param: ':', useCache: true };
const defaultListenerOptions: ListenerOptions = { bulk: false, debug: false };
const defaultUpdateOptions: UpdateOptions = { only: [] };

function createCache(): CacheCollectionApi {
  const cache: CacheCollection = {};
  const api = {
    has(key: string, secondKey: string): boolean {
      return typeof cache[key] !== 'undefined' && typeof cache[key][secondKey] !== 'undefined';
    },

    get(key: string, secondKey: string): CacheGetResult {
      if (this.has(key, secondKey)) {
        return cache[key][secondKey];
      }
      return undefined;
    },

    set(key: string, secondKey: string, value: CacheValue): CacheValue {
      if (typeof cache[key] === 'undefined') {
        cache[key] = {};
      }
      cache[key][secondKey] = value;
      return value;
    },

    delete(key: string, secondKey: string | undefined) {
      if (typeof cache[key] === 'undefined') {
        return;
      }
      if (typeof secondKey === 'undefined') {
        delete cache[key];
        return;
      }
      delete cache[key][secondKey];
    }
  };
  return api;
}

export default class DeepState {
  listeners: Listeners;
  data: any;
  options: any;
  cache: CacheCollectionApi;

  constructor(data = {}, options: Options = defaultOptions) {
    this.listeners = {};
    this.data = data;
    this.options = { ...defaultOptions, ...options };
    this.cache = createCache();
  }

  getListeners(): Listeners {
    return this.listeners;
  }

  destroy() {
    this.data = undefined;
    this.listeners = {};
  }

  match(first: string, second: string): boolean {
    if (first === second) {
      return true;
    }
    if (this.options.useCache && this.cache.has(first, second)) {
      return this.cache.get(first, second).match;
    }
    const matched = this.isWildcard(first) ? match(first, second) : false;
    if (this.options.useCache) {
      this.cache.set(first, second, { match: matched, params: undefined });
    }
    return matched;
  }

  cutPath(longer: string, shorter: string): string {
    return this.split(this.cleanRecursivePath(longer))
      .slice(0, this.split(this.cleanRecursivePath(shorter)).length)
      .join(this.options.delimeter);
  }

  trimPath(path: string): string {
    return this.cleanRecursivePath(path).replace(
      new RegExp(`^\\${this.options.delimeter}+|\\${this.options.delimeter}+$`),
      ''
    );
  }

  split(path: string) {
    return path === '' ? [] : path.split(this.options.delimeter);
  }

  isWildcard(path: string): boolean {
    return path.indexOf('*') > -1;
  }

  isRecursive(path: string): boolean {
    return path.endsWith(this.options.recursive);
  }

  cleanRecursivePath(path: string): string {
    return this.isRecursive(path) ? path.slice(0, -this.options.recursive.length) : path;
  }

  recursiveMatch(listenerPath: string, modifiedPath: string): boolean {
    return this.cutPath(modifiedPath, this.cleanRecursivePath(listenerPath)) === listenerPath;
  }

  hasParams(path: string) {
    return path.indexOf(this.options.param) > -1;
  }

  getParamsInfo(path: string): ParamsInfo {
    let paramsInfo: ParamsInfo = { replaced: '', original: path, params: {} };
    let partIndex = 0;
    let fullReplaced = [];
    for (const part of this.split(path)) {
      paramsInfo.params[partIndex] = {
        original: part,
        replaced: '',
        name: ''
      };
      const reg = new RegExp(`\\${this.options.param}([^\\${this.options.delimeter}\\${this.options.param}]+)`, 'g');
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
      paramsInfo.params[partIndex].replaced = part.replace(reg, '*');
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

  subscribeAll(userPaths: string[], fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions) {
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
      ...{
        listeners: [],
        isRecursive: false,
        isWildcard: false,
        hasParams: false,
        match: undefined,
        paramsInfo: undefined,
        path: undefined
      },
      ...values
    };
  }

  getCleanListener(fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions): Listener {
    return {
      fn,
      options: { ...defaultListenerOptions, ...options }
    };
  }

  getListenerCollectionMatch(listenerPath: string, isRecursive: boolean, isWildcard: boolean) {
    return (path) => {
      const originalPath = path;
      if (this.options.useCache && this.cache.has(listenerPath, path)) {
        return this.cache.get(listenerPath, path).match;
      }
      let result = false;
      if (isRecursive) {
        path = this.cutPath(path, listenerPath);
      }
      if (isWildcard && wildcard.match(listenerPath, path)) {
        result = true;
      } else {
        result = listenerPath === path;
      }
      if (this.options.useCache) {
        this.cache.set(listenerPath, originalPath, { match: result, params: undefined });
      }
      return result;
    };
  }

  debugSubscribe(listener: Listener, listenersCollection: ListenersCollection, listenerPath: string) {
    if (listener.options.debug) {
      console.debug('listener subsrcibed', listenerPath, listener, listenersCollection);
    }
  }

  getListenersCollection(listenerPath: string, listener: Listener): ListenersCollection {
    let collCfg = {
      isRecursive: false,
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
    if (this.isRecursive(collCfg.path)) {
      collCfg.path = this.cleanRecursivePath(collCfg.path);
      collCfg.isRecursive = true;
    }
    let listenersCollection;
    if (typeof this.listeners[collCfg.path] === 'undefined') {
      listenersCollection = this.listeners[collCfg.path] = this.getCleanListenersCollection({
        ...collCfg,
        match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard)
      });
    } else {
      listenersCollection = this.listeners[collCfg.path];
    }
    listenersCollection.listeners.push(listener);
    return listenersCollection;
  }

  subscribe(listenerPath: string, fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions) {
    if (typeof listenerPath === 'function') {
      fn = listenerPath;
      listenerPath = '';
    }
    let listener = this.getCleanListener(fn, options);
    const listenersCollection = this.getListenersCollection(listenerPath, listener);
    listenerPath = listenersCollection.path;
    if (!listenersCollection.isWildcard) {
      fn(
        path(this.split(listenerPath), this.data),
        listenerPath,
        this.getParams(listenersCollection.paramsInfo, listenerPath)
      );
    }
    if (listenersCollection.isWildcard) {
      const paths = scanObject(this.data, this.options.delimeter).get(listenerPath);
      if (options.bulk) {
        const bulkValue = [];
        for (const path in paths) {
          bulkValue.push({
            path,
            params: this.getParams(listenersCollection.paramsInfo, path),
            value: paths[path]
          });
        }
        fn(bulkValue, undefined, undefined);
      } else {
        for (const path in paths) {
          fn(paths[path], path, this.getParams(listenersCollection.paramsInfo, path));
        }
      }
    }
    this.debugSubscribe(listener, listenersCollection, listenerPath);
    return this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener) {
    return () => {
      for (const listenerPath in this.listeners) {
        this.listeners[listenerPath].listeners = this.listeners[listenerPath].listeners.filter(
          (current) => current !== listener
        );
        if (this.listeners[listenerPath].listeners.length === 0) {
          delete this.listeners[listenerPath];
        }
      }
    };
  }

  same(newValue, oldValue): boolean {
    return (
      (['number', 'string', 'undefined', 'boolean'].includes(typeof newValue) || newValue === null) &&
      oldValue === newValue
    );
  }

  debugListener(listener: Listener, time: number, value, params, path, listenerPath) {
    if (listener.options.debug) {
      console.debug('listener updated', {
        time: Date.now() - time,
        value,
        params,
        path,
        listenerPath
      });
    }
  }

  debugTime(listener: Listener): number {
    return listener.options.debug ? Date.now() : 0;
  }

  notifySubscribedListeners(
    modifiedPath: string,
    newValue,
    alreadyNotified: ListenersCollection[] = []
  ): ListenersCollection[] {
    for (let listenerPath in this.listeners) {
      const listenersCollection = this.listeners[listenerPath];
      if (listenersCollection.match(modifiedPath)) {
        alreadyNotified.push(listenersCollection);
        const value = listenersCollection.isRecursive ? this.get(this.cutPath(modifiedPath, listenerPath)) : newValue;
        const params = listenersCollection.paramsInfo
          ? this.getParams(listenersCollection.paramsInfo, modifiedPath)
          : undefined;
        for (const listener of listenersCollection.listeners) {
          const time = this.debugTime(listener);
          listener.options.bulk
            ? listener.fn([{ value, path: modifiedPath, params }], undefined, undefined)
            : listener.fn(value, modifiedPath, params);
          this.debugListener(listener, time, value, params, modifiedPath, listenerPath);
        }
      }
    }
    return alreadyNotified;
  }

  notifyNestedListeners(modifiedPath: string, newValue, alreadyNotified: ListenersCollection[]) {
    for (let listenerPath in this.listeners) {
      const listenersCollection = this.listeners[listenerPath];
      if (alreadyNotified.includes(listenersCollection)) {
        continue;
      }
      const currentCuttedPath = this.cutPath(listenerPath, modifiedPath);
      if (this.match(currentCuttedPath, modifiedPath)) {
        const restPath = this.trimPath(listenerPath.substr(currentCuttedPath.length));
        const values = wildcard.scanObject(newValue, this.options.delimeter).get(restPath);
        const params = listenersCollection.paramsInfo
          ? this.getParams(listenersCollection.paramsInfo, modifiedPath)
          : undefined;
        const bulk = [];
        for (const currentRestPath in values) {
          const value = values[currentRestPath];
          const fullPath = [modifiedPath, currentRestPath].join(this.options.delimeter);
          for (const listener of listenersCollection.listeners) {
            const time = this.debugTime(listener);
            listener.options.bulk ? bulk.push({ value, path: fullPath, params }) : listener.fn(value, fullPath, params);
            this.debugListener(listener, time, value, params, modifiedPath, listenerPath);
          }
        }
        for (const listener of listenersCollection.listeners) {
          if (listener.options.bulk) {
            const time = this.debugTime(listener);
            listener.fn(bulk, undefined, undefined);
            this.debugListener(listener, time, bulk, params, modifiedPath, listenerPath);
          }
        }
      }
    }
  }

  notifyOnly(modifiedPath: string, newValue, options: UpdateOptions): boolean {
    if (
      typeof options.only !== 'undefined' &&
      Array.isArray(options.only) &&
      options.only.length &&
      this.canBeNested(newValue)
    ) {
      let alreadyNotified = [];
      options.only.forEach((notifyPath) => {
        const wildcarded = wildcard.scanObject(newValue, this.options.delimeter).get(notifyPath);
        for (const wildcardPath in wildcarded) {
          alreadyNotified = [
            ...alreadyNotified,
            ...this.notifySubscribedListeners(
              modifiedPath + this.options.delimeter + wildcardPath,
              wildcarded[wildcardPath]
            )
          ];
        }
      });
      options.only.forEach((notifyPath) => {
        const wildcarded = wildcard.scanObject(newValue, this.options.delimeter).get(notifyPath);
        for (const wildcardPath in wildcarded) {
          this.notifyNestedListeners(
            modifiedPath + this.options.delimeter + wildcardPath,
            wildcarded[wildcardPath],
            alreadyNotified
          );
        }
      });
      return true;
    }
    return false;
  }

  canBeNested(newValue): boolean {
    if (typeof newValue !== 'undefined' && newValue !== null) {
      if (newValue.constructor.name === 'Object' || Array.isArray(newValue)) {
        return true;
      }
    }
    return false;
  }

  update(modifiedPath: string, fn: Updater, options: UpdateOptions = defaultUpdateOptions) {
    if (this.isWildcard(modifiedPath)) {
      for (const path in wildcard.scanObject(this.data, this.options.delimeter).get(modifiedPath)) {
        this.update(path, fn);
      }
      return;
    }
    const lens = lensPath(this.split(modifiedPath));
    let oldValue = view(lens, this.data);
    if (typeof oldValue !== 'undefined' && oldValue !== null) {
      if (typeof oldValue === 'object' && oldValue.constructor.name === 'Object') {
        oldValue = { ...oldValue };
      } else if (Array.isArray(oldValue)) {
        oldValue = oldValue.slice();
      }
    }
    let newValue;
    if (typeof fn === 'function') {
      newValue = fn(view(lens, this.data));
    } else {
      newValue = fn;
    }
    if (this.same(newValue, oldValue)) {
      return newValue;
    }
    this.data = set(lens, newValue, this.data);
    options = { ...defaultUpdateOptions, ...options };
    if (this.notifyOnly(modifiedPath, newValue, options)) {
      return newValue;
    }
    const alreadyNotified = this.notifySubscribedListeners(modifiedPath, newValue);
    if (this.canBeNested(newValue)) {
      this.notifyNestedListeners(modifiedPath, newValue, alreadyNotified);
    }
    return newValue;
  }

  get(userPath: string | undefined = undefined) {
    if (typeof userPath === 'undefined' || userPath === '') {
      return this.data;
    }
    return path(this.split(userPath), this.data);
  }
}

export const State = DeepState;
