import { path, set, view, lensPath } from 'ramda';
import clone from 'fast-copy';
import wildcard from './wildcard-object-scan';
export type ListenerFunction = (value: any, path: string, params: any) => {};
export type Match = (path: string) => boolean;

export interface Options {
  delimeter: string;
  recursive: string;
  param: string;
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

export interface ParamsInfo {
  params: Parameters;
  replaced: string;
  original: string;
}

export const scanObject = wildcard.scanObject;
export const match = wildcard.match;

const defaultOptions: Options = { delimeter: '.', recursive: '...', param: ':' };
const defaultListenerOptions: ListenerOptions = { bulk: false, debug: false };

export default class DeepState {
  listeners: Listeners;
  data: any;
  options: any;

  constructor(data = {}, options: Options = defaultOptions) {
    this.listeners = {};
    this.data = data;
    this.options = { ...defaultOptions, ...options };
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

  recursiveMatch(listenerPath: string, userPath: string): boolean {
    return this.cutPath(this.cleanRecursivePath(listenerPath), userPath) === listenerPath;
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

  getParams(paramsInfo: ParamsInfo | undefined, path: string) {
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

  getCleanListenersCollection(): ListenersCollection {
    return {
      listeners: [],
      isRecursive: false,
      isWildcard: false,
      hasParams: false,
      match: undefined,
      paramsInfo: undefined
    };
  }

  getCleanListener(fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions): Listener {
    return {
      fn,
      options: { ...defaultListenerOptions, ...options }
    };
  }

  subscribe(listenerPath: string, fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions) {
    if (typeof listenerPath === 'function') {
      fn = listenerPath;
      listenerPath = '';
    }
    let listener = this.getCleanListener(fn, options);
    let originalPath = listenerPath;
    let paramsInfo;
    let hasParams = false;
    let isRecursive = false;
    if (this.hasParams(listenerPath)) {
      paramsInfo = this.getParamsInfo(listenerPath);
      listenerPath = paramsInfo.replaced;
      hasParams = true;
    }
    const isWildcard = this.isWildcard(listenerPath);
    if (this.isRecursive(listenerPath)) {
      listenerPath = this.cleanRecursivePath(listenerPath);
      isRecursive = true;
    }
    let listenersCollection;
    if (typeof this.listeners[originalPath] === 'undefined') {
      listenersCollection = this.listeners[originalPath] = this.getCleanListenersCollection();
      listenersCollection.isWildcard = isWildcard;
      listenersCollection.hasParams = hasParams;
      listenersCollection.isRecursive = isRecursive;
      listenersCollection.paramsInfo = paramsInfo;
      listenersCollection.match = (path) => {
        if (isRecursive && this.recursiveMatch(listenerPath, path)) {
          return true;
        }
        if (isWildcard && wildcard.match(listenerPath, path)) {
          return true;
        }
        return listenerPath === path;
      };
    } else {
      listenersCollection = this.listeners[originalPath];
    }
    listenersCollection.listeners.push(listener);
    if (!isWildcard) {
      fn(path(this.split(listenerPath), this.data), listenerPath, this.getParams(paramsInfo, listenerPath));
    }
    if (isWildcard) {
      const paths = scanObject(this.data, this.options.delimeter).get(listenerPath);
      if (options.bulk) {
        const bulkValue = [];
        for (const path in paths) {
          bulkValue.push({
            path,
            params: this.getParams(paramsInfo, path),
            value: paths[path]
          });
        }
        fn(bulkValue, undefined, undefined);
      } else {
        for (const path in paths) {
          fn(paths[path], path, this.getParams(paramsInfo, path));
        }
      }
    }
    if (listener.options.debug) {
      console.debug('listener subsrcibed', listenerPath, listener);
    }
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

  notifySubscribedListeners(modifiedPath: string, newValue): string[] {
    const alreadyNotified = [];
    for (let listenerPath in this.listeners) {
      const listenersCollection = this.listeners[listenerPath];
      if (listenersCollection.match(modifiedPath)) {
        alreadyNotified.push(listenerPath);
        const value = listenersCollection.isRecursive ? this.get(this.cleanRecursivePath(listenerPath)) : newValue;
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

  notifyNestedListeners(modifiedPath: string, newValue, alreadyNotified: string[]) {
    for (let listenerPath in this.listeners) {
      if (alreadyNotified.includes(listenerPath)) {
        continue;
      }
      const listenersCollection = this.listeners[listenerPath];
      const nestedPath = this.cutPath(modifiedPath, listenerPath);
      if (this.match(nestedPath, modifiedPath)) {
        const restPath = this.trimPath(listenerPath.substr(nestedPath.length));
        const values = wildcard.scanObject(newValue, this.options.delimeter).get(restPath);
        for (const currentRestPath in values) {
          const value = values[currentRestPath];
          const fullPath = [modifiedPath, currentRestPath].join(this.options.delimeter);
          const params = listenersCollection.paramsInfo
            ? this.getParams(listenersCollection.paramsInfo, modifiedPath)
            : undefined;
          for (const listener of listenersCollection.listeners) {
            const time = this.debugTime(listener);
            listener.options.bulk
              ? listener.fn([{ value, path: fullPath, params }], undefined, undefined)
              : listener.fn(value, fullPath, params);
            this.debugListener(listener, time, value, params, modifiedPath, listenerPath);
          }
        }
      }
    }
  }

  update(modifiedPath: string, fn: Updater) {
    const lens = lensPath(this.split(modifiedPath));
    let oldValue = clone(view(lens, this.data));
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
    const alreadyNotified = this.notifySubscribedListeners(modifiedPath, newValue);
    if (newValue.constructor.name === 'Object' || Array.isArray(newValue)) {
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

  static clone(obj) {
    return clone(obj);
  }
}

export const State = DeepState;
