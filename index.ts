import { path, set, view, lensPath } from 'ramda';
import clone from 'fast-copy';
import wildcard from './wildcard-object-scan';
export type ListenerFunction = (value: any, path: string, params: any) => {};
export interface ListenerOptions {
  bulk: boolean;
}
export interface Listener {
  fn: ListenerFunction;
  options: ListenerOptions;
}

export type Updater = (value: any) => {};

export interface Listeners {
  [key: string]: Listener[];
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
export const wildcardToRegex = wildcard.wildcardToRegex;

const defaultOptions = { delimeter: '.', recursive: '...', param: ':' };
const defaultListenerOptions = { bulk: false };

export default class DeepState {
  listeners: Listeners;
  data: any;
  options: any;

  constructor(data = {}, options = defaultOptions) {
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
      return match(first, second, this.options.delimeter);
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

  recursiveMatch(listenerPath: string, userPath: string): boolean {
    const normalized = this.getRecursive(listenerPath);
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

  subscribe(userPath: string, fn: ListenerFunction, options: ListenerOptions = defaultListenerOptions) {
    if (typeof userPath === 'function') {
      fn = userPath;
      userPath = '';
    }
    let listener: Listener = { fn, options: { ...defaultListenerOptions, ...options } };
    let originalPath = userPath;
    let paramsInfo;
    if (this.hasParams(userPath)) {
      paramsInfo = this.getParamsInfo(userPath);
      userPath = paramsInfo.replaced;
    }
    if (this.isRecursive(userPath)) {
      userPath = this.getRecursive(userPath);
    }
    if (!Array.isArray(this.listeners[originalPath])) {
      this.listeners[originalPath] = [];
    }
    this.listeners[originalPath].push({ fn, options });
    const isWildcard = this.isWildcard(userPath);
    if (!isWildcard) {
      fn(path(this.split(userPath), this.data), userPath, this.getParams(paramsInfo, userPath));
    }
    if (isWildcard) {
      const paths = scanObject(this.data, this.options.delimeter).get(userPath);
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
    return this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener) {
    return () => {
      for (const listenerPath in this.listeners) {
        this.listeners[listenerPath] = this.listeners[listenerPath].filter((current) => current !== listener);
        if (this.listeners[listenerPath].length === 0) {
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
      let originalListenerPath = listenerPath;
      let match = false;
      let recursive = false;
      let paramsInfo;
      if (this.hasParams(listenerPath)) {
        paramsInfo = this.getParamsInfo(listenerPath);
        listenerPath = paramsInfo.replaced;
      }
      if (this.isRecursive(listenerPath) && this.recursiveMatch(listenerPath, userPath)) {
        match = true;
        listenerPath = this.getRecursive(listenerPath);
        recursive = true;
      }
      if (this.match(listenerPath, userPath)) {
        match = true;
      }
      if (match) {
        const bulkListeners = [];
        const standardListeners = [];
        for (const listener of this.listeners[originalListenerPath]) {
          if (listener.options.bulk) {
            bulkListeners.push(listener);
          } else {
            standardListeners.push(listener);
          }
        }
        const value = recursive ? this.get(listenerPath) : newValue;
        for (const listener of standardListeners) {
          listener.fn(value, userPath, paramsInfo ? paramsInfo.params : undefined);
        }
        for (const listener of bulkListeners) {
          listener.fn([
            {
              value,
              path: userPath,
              params: paramsInfo ? paramsInfo.params : undefined
            }
          ]);
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
