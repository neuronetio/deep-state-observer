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
  match: Match | undefined;
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
    if (this.isWildcard(first)) {
      return match(first, second);
    }
    return false;
  }

  split(path: string) {
    if (path === '') {
      return [];
    }
    return path.split(this.options.delimeter);
  }

  isWildcard(path: string): boolean {
    return path.indexOf('*') > -1;
  }

  isRecursive(path: string): boolean {
    return path.endsWith(this.options.recursive);
  }

  getRecursive(path: string): string {
    return path.slice(0, -this.options.recursive.length);
  }

  recursiveMatch(listenerPath: string, userPath: string, convert = true): boolean {
    let normalized = listenerPath;
    if (convert) {
      normalized = this.getRecursive(listenerPath);
    }
    return userPath.slice(0, normalized.length) === normalized || normalized.slice(0, userPath.length) === userPath;
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

  subscribeAll(userPaths: string[], fn: ListenerFunction) {
    let unsubscribers = [];
    for (const userPath of userPaths) {
      unsubscribers.push(this.subscribe(userPath, fn));
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
      options: { ...defaultListenerOptions, ...options },
      match: undefined
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
      listenerPath = this.getRecursive(listenerPath);
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
        if (isRecursive && this.recursiveMatch(listenerPath, path, false)) {
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

  update(userPath: string, fn: Updater) {
    const lens = lensPath(this.split(userPath));
    let oldValue = clone(view(lens, this.data));
    let newValue;
    if (typeof fn === 'function') {
      newValue = fn(view(lens, this.data));
    } else {
      newValue = fn;
    }
    if (
      (['number', 'string', 'undefined', 'boolean'].includes(typeof newValue) || newValue === null) &&
      oldValue === newValue
    ) {
      return newValue;
    }
    this.data = set(lens, newValue, this.data);
    for (let listenerPath in this.listeners) {
      const listenersCollection = this.listeners[listenerPath];
      if (listenersCollection.match(userPath)) {
        const bulkListeners = [];
        const standardListeners = [];
        for (const listener of listenersCollection.listeners) {
          if (listener.options.bulk) {
            bulkListeners.push(listener);
          } else {
            standardListeners.push(listener);
          }
        }
        const value = listenersCollection.isRecursive ? this.get(this.getRecursive(listenerPath)) : newValue;
        for (const listener of standardListeners) {
          let time;
          if (listener.options.debug) {
            time = performance.now();
          }
          const params = listenersCollection.paramsInfo
            ? this.getParams(listenersCollection.paramsInfo, userPath)
            : undefined;
          listener.fn(value, userPath, params);
          if (listener.options.debug) {
            console.debug('listener updated', {
              time: performance.now() - time,
              value,
              params,
              path: userPath,
              listenerPath
            });
          }
        }
        for (const listener of bulkListeners) {
          let time;
          if (listener.options.debug) {
            time = performance.now();
          }
          const params = listenersCollection.paramsInfo
            ? this.getParams(listenersCollection.paramsInfo, userPath)
            : undefined;
          listener.fn([
            {
              value,
              path: userPath,
              params
            }
          ]);
          if (listener.options.debug) {
            console.debug('listener updated', {
              time: performance.now() - time,
              value,
              params,
              path: userPath,
              listenerPath
            });
          }
        }
      }
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
