import { path, set, view, lensPath } from 'ramda';
import wildcard from './wildcard-object-scan';

export type ListenerFunction = (value: any, path: string, params: any) => {};
export type Match = (path: string) => boolean;

export interface Options {
  delimeter: string;
  recursive: string;
  param: string;
  useCache: boolean;
  usePathCache: boolean;
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

export interface ListenersObject {
  [key: string]: Listener;
  [key: number]: Listener;
}

export interface ListenersCollection {
  path: string;
  listeners: ListenersObject;
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

export interface UpdateOptions {
  only: string[];
}

export const scanObject = wildcard.scanObject;
export const match = wildcard.match;

const defaultOptions: Options = { delimeter: '.', recursive: '...', param: ':', useCache: false, usePathCache: true };
const defaultListenerOptions: ListenerOptions = { bulk: false, debug: false };
const defaultUpdateOptions: UpdateOptions = { only: [] };

export default class DeepState {
  listeners: Listeners;
  data: any;
  options: any;
  id: number;

  constructor(data = {}, options: Options = defaultOptions) {
    this.listeners = {};
    this.data = data;
    this.options = { ...defaultOptions, ...options };
    this.id = 0;
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
    return this.isWildcard(first) ? match(first, second) : false;
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
        listeners: {},
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
      let result = false;
      if (isRecursive) {
        path = this.cutPath(path, listenerPath);
      }
      if (isWildcard && wildcard.match(listenerPath, path)) {
        result = true;
      } else {
        result = listenerPath === path;
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
    this.id++;
    listenersCollection.listeners[this.id] = listener;
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
    return this.unsubscribe.bind({ id: this.id, listeners: listenersCollection.listeners });
  }

  unsubscribe() {
    delete this.listeners[this.id];
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
        for (const listenerId in listenersCollection.listeners) {
          const listener = listenersCollection.listeners[listenerId];
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
          for (const listenerId in listenersCollection.listeners) {
            const listener = listenersCollection.listeners[listenerId];
            const time = this.debugTime(listener);
            listener.options.bulk ? bulk.push({ value, path: fullPath, params }) : listener.fn(value, fullPath, params);
            this.debugListener(listener, time, value, params, modifiedPath, listenerPath);
          }
        }
        for (const listenerId in listenersCollection.listeners) {
          const listener = listenersCollection.listeners[listenerId];
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
      options.only.forEach((notifyPath) => {
        const wildcardScan = wildcard.scanObject(newValue, this.options.delimeter).get(notifyPath);
        const bulk = [];
        const bulkListeners = [];
        for (const wildcardPath in wildcardScan) {
          const fullPath = modifiedPath + this.options.delimeter + wildcardPath;
          for (const listenerPath in this.listeners) {
            const listenersCollection = this.listeners[listenerPath];
            if (this.match(listenerPath, fullPath)) {
              const params = listenersCollection.paramsInfo
                ? this.getParams(listenersCollection.paramsInfo, fullPath)
                : undefined;
              const value = wildcardScan[wildcardPath];
              bulk.push({ value, path: fullPath, params });
              for (const listenerId in listenersCollection.listeners) {
                const listener = listenersCollection.listeners[listenerId];
                if (listener.options.bulk) {
                  if (!bulkListeners.includes(listener)) {
                    bulkListeners.push(listener);
                  }
                } else {
                  listener.fn(value, fullPath, params);
                }
              }
            }
          }
        }
        for (const listener of bulkListeners) {
          listener.fn(bulk, undefined, undefined);
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
