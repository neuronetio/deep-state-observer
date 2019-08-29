import { path, set, view, lensPath } from 'ramda';
import clone from 'fast-copy';
import wildcard from './wildcard-object-scan';

export type Listener = (value: any, path: string) => {};
export type ListenerAll = (valueOrPath: any, value: any | undefined) => {};
export type Updater = (value: any) => {};

export interface IListeners {
  [key: string]: Listener[];
}

export const scanObject = wildcard.scanObject;
export const match = wildcard.match;
export const wildcardToRegex = wildcard.wildcardToRegex;

export default class DeepStore {
  listeners: IListeners;
  data: any;
  options: any;

  constructor(data = {}, options = { delimeter: '.', recursiveWatchString: '...' }) {
    this.listeners = {};
    this.data = data;
    this.options = options;
  }

  getListeners(): IListeners {
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
    return path.endsWith(this.options.recursiveWatchString);
  }

  getRecursive(path: string): string {
    return path.slice(0, -this.options.recursiveWatchString.length);
  }

  recursiveMatch(currentPath: string, userPath: string): boolean {
    const normalized = this.getRecursive(currentPath);
    return userPath.slice(0, normalized.length) === normalized;
  }

  subscribeAll(userPaths: string[], fn: ListenerAll) {
    let unsubscribers = [];
    for (let userPath of userPaths) {
      let original = userPath;
      if (this.isRecursive(userPath)) {
        userPath = this.getRecursive(userPath);
      }
      const wrappedSubscriber = (((newValue, path) => {
        fn(newValue, userPath);
      }) as any) as Listener;
      unsubscribers.push(this.subscribe(original, wrappedSubscriber));
    }
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      unsubscribers = [];
    };
  }

  subscribe(userPath: string, fn: Listener, execute = true) {
    if (typeof userPath === 'function') {
      fn = userPath;
      userPath = '';
    }
    let recursivePath = userPath;
    if (this.isRecursive(userPath)) {
      userPath = this.getRecursive(userPath);
    }
    if (!Array.isArray(this.listeners[recursivePath])) {
      this.listeners[recursivePath] = [];
    }
    this.listeners[recursivePath].push(fn);
    const isWildcard = this.isWildcard(userPath);
    if (execute && !isWildcard) {
      fn(path(this.split(userPath), this.data), userPath);
    }
    if (isWildcard) {
      const paths = scanObject(this.data, this.options.delimeter).get(userPath);
      for (const path in paths) {
        fn(paths[path], path);
      }
    }
    return this.unsubscribe(fn);
  }

  unsubscribe(fn: Listener) {
    return () => {
      for (const currentPath in this.listeners) {
        this.listeners[currentPath] = this.listeners[currentPath].filter((current) => current !== fn);
        if (this.listeners[currentPath].length === 0) {
          delete this.listeners[currentPath];
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
    for (const currentPath in this.listeners) {
      if (this.isRecursive(currentPath) && this.recursiveMatch(currentPath, userPath)) {
        for (const listener of this.listeners[currentPath]) {
          listener(newValue, userPath);
        }
      } else if (this.match(currentPath, userPath)) {
        for (const listener of this.listeners[currentPath]) {
          listener(newValue, userPath);
        }
      }
    }
    return newValue;
  }

  get(userPath: string | undefined = undefined) {
    if (typeof userPath === 'undefined' || userPath === '') {
      return this.data;
    }
    return path(userPath.split('.'), this.data);
  }

  static clone(obj) {
    return clone(obj);
  }
}

export const Store = DeepStore;
