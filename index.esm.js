/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// forked from https://github.com/joonhocho/superwild
const segments = [];
function Match(pattern, match, wchar = "*") {
    if (pattern === wchar) {
        return true;
    }
    segments.length = 0;
    let starCount = 0;
    let minLength = 0;
    let maxLength = 0;
    let segStartIndex = 0;
    for (let i = 0, len = pattern.length; i < len; i += 1) {
        const char = pattern[i];
        if (char === wchar) {
            starCount += 1;
            if (i > segStartIndex) {
                segments.push(pattern.substring(segStartIndex, i));
            }
            segments.push(char);
            segStartIndex = i + 1;
        }
    }
    if (segStartIndex < pattern.length) {
        segments.push(pattern.substring(segStartIndex));
    }
    if (starCount) {
        minLength = pattern.length - starCount;
        maxLength = Infinity;
    }
    else {
        maxLength = minLength = pattern.length;
    }
    if (segments.length === 0) {
        return pattern === match;
    }
    const length = match.length;
    if (length < minLength || length > maxLength) {
        return false;
    }
    let segLeftIndex = 0;
    let segRightIndex = segments.length - 1;
    let rightPos = match.length - 1;
    let rightIsStar = false;
    while (true) {
        const segment = segments[segRightIndex];
        segRightIndex -= 1;
        if (segment === wchar) {
            rightIsStar = true;
        }
        else {
            const lastIndex = rightPos + 1 - segment.length;
            const index = match.lastIndexOf(segment, lastIndex);
            if (index === -1 || index > lastIndex) {
                return false;
            }
            if (rightIsStar) {
                rightPos = index - 1;
                rightIsStar = false;
            }
            else {
                if (index !== lastIndex) {
                    return false;
                }
                rightPos -= segment.length;
            }
        }
        if (segLeftIndex > segRightIndex) {
            break;
        }
    }
    return true;
}

class WildcardObject {
    constructor(obj, delimiter, wildcard, is_match = undefined) {
        this.obj = obj;
        this.delimiter = delimiter;
        this.wildcard = wildcard;
        this.is_match = is_match;
    }
    shortMatch(first, second) {
        if (first === second)
            return true;
        if (first === this.wildcard)
            return true;
        if (this.is_match)
            return this.is_match(first, second);
        const index = first.indexOf(this.wildcard);
        if (index > -1) {
            const end = first.substr(index + 1);
            if (index === 0 || second.substring(0, index) === first.substring(0, index)) {
                const len = end.length;
                if (len > 0) {
                    return second.substr(-len) === end;
                }
                return true;
            }
        }
        return false;
    }
    match(first, second) {
        if (this.is_match)
            return this.is_match(first, second);
        return (first === second ||
            first === this.wildcard ||
            second === this.wildcard ||
            this.shortMatch(first, second) ||
            Match(first, second, this.wildcard));
    }
    handleArray(wildcard, currentArr, partIndex, path, result = {}) {
        let nextPartIndex = wildcard.indexOf(this.delimiter, partIndex);
        let end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcard.length;
        }
        const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
        let index = 0;
        for (const item of currentArr) {
            const key = index.toString();
            const currentPath = path === "" ? key : path + this.delimiter + index;
            if (currentWildcardPath === this.wildcard ||
                currentWildcardPath === key ||
                this.shortMatch(currentWildcardPath, key)) {
                end ? (result[currentPath] = item) : this.goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
            }
            index++;
        }
        return result;
    }
    handleObject(wildcardPath, currentObj, partIndex, path, result = {}) {
        let nextPartIndex = wildcardPath.indexOf(this.delimiter, partIndex);
        let end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcardPath.length;
        }
        const currentWildcardPath = wildcardPath.substring(partIndex, nextPartIndex);
        for (let key in currentObj) {
            key = key.toString();
            const currentPath = path === "" ? key : path + this.delimiter + key;
            if (currentWildcardPath === this.wildcard ||
                currentWildcardPath === key ||
                this.shortMatch(currentWildcardPath, key)) {
                if (end) {
                    result[currentPath] = currentObj[key];
                }
                else {
                    this.goFurther(wildcardPath, currentObj[key], nextPartIndex + 1, currentPath, result);
                }
            }
        }
        return result;
    }
    goFurther(path, currentObj, partIndex, currentPath, result = {}) {
        if (Array.isArray(currentObj)) {
            return this.handleArray(path, currentObj, partIndex, currentPath, result);
        }
        return this.handleObject(path, currentObj, partIndex, currentPath, result);
    }
    get(path) {
        return this.goFurther(path, this.obj, 0, "");
    }
}

class ObjectPath {
    static get(path, obj, create = false) {
        if (!obj)
            return;
        let currObj = obj;
        for (const currentPath of path) {
            if (currentPath in currObj) {
                currObj = currObj[currentPath];
            }
            else if (create) {
                currObj[currentPath] = Object.create({});
                currObj = currObj[currentPath];
            }
            else {
                return;
            }
        }
        return currObj;
    }
    static set(path, value, obj) {
        if (!obj)
            return;
        if (path.length === 0) {
            for (const key in obj) {
                delete obj[key];
            }
            for (const key in value) {
                obj[key] = value[key];
            }
            return;
        }
        const prePath = path.slice();
        const lastPath = prePath.pop();
        const get = ObjectPath.get(prePath, obj, true);
        if (typeof get === "object") {
            get[lastPath] = value;
        }
        return value;
    }
}

let wasm;

let WASM_VECTOR_LEN = 0;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

let cachedTextEncoder = new TextEncoder("utf-8");

const encodeString =
  typeof cachedTextEncoder.encodeInto === "function"
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3));
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}
/**
 * @param {string} pattern
 * @param {string} input
 * @returns {boolean}
 */
function is_match(pattern, input) {
  var ptr0 = passStringToWasm0(pattern, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  var ret = wasm.is_match(ptr0, len0, ptr1, len1);
  return ret !== 0;
}

async function load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

async function init(input) {
  const imports = {};
  if (
    typeof input === "string" ||
    (typeof Request === "function" && input instanceof Request) ||
    (typeof URL === "function" && input instanceof URL)
  ) {
    input = fetch(input);
  }
  const { instance, module } = await load(await input, imports);
  wasm = instance.exports;
  init.__wbindgen_wasm_module = module;
  return wasm;
}

const defaultUpdateOptions = {
    only: [],
    source: "",
    debug: false,
    data: undefined,
    queue: false,
    force: false,
};
function log(message, info) {
    console.debug(message, info);
}
function getDefaultOptions() {
    return {
        delimiter: `.`,
        debug: false,
        extraDebug: false,
        useMute: true,
        notRecursive: `;`,
        param: `:`,
        wildcard: `*`,
        experimentalMatch: false,
        queue: false,
        defaultBulkValue: true,
        useCache: false,
        useSplitCache: false,
        useIndicesCache: false,
        maxSimultaneousJobs: 1000,
        maxQueueRuns: 1000,
        log,
        Promise,
    };
}
/**
 * Is object - helper function to determine if specified variable is an object
 *
 * @param {any} item
 * @returns {boolean}
 */
function isObject(item) {
    if (item && item.constructor) {
        return item.constructor.name === "Object";
    }
    return typeof item === "object" && item !== null;
}
class DeepState {
    constructor(data = {}, options = {}) {
        this.jobsRunning = 0;
        this.updateQueue = [];
        this.subscribeQueue = [];
        this.listenersIgnoreCache = new WeakMap();
        this.is_match = null;
        this.destroyed = false;
        this.queueRuns = 0;
        this.groupId = 0;
        this.namedGroups = [];
        this.numberGroups = [];
        this.traceId = 0;
        this.traceMap = new Map();
        this.tracing = [];
        this.savedTrace = [];
        this.collection = null;
        this.collections = 0;
        this.cache = new Map();
        this.splitCache = new Map();
        this.indices = new Map();
        this.indicesCount = new Map();
        this.lastExecs = new WeakMap();
        this.listeners = new Map();
        this.waitingListeners = new Map();
        this.options = Object.assign(Object.assign({}, getDefaultOptions()), options);
        this.data = data;
        this.id = 0;
        if (!this.options.useCache) {
            this.pathGet = ObjectPath.get;
            this.pathSet = ObjectPath.set;
        }
        else {
            this.pathGet = this.cacheGet;
            this.pathSet = this.cacheSet;
        }
        if (options.Promise) {
            this.resolved = options.Promise.resolve();
        }
        else {
            this.resolved = Promise.resolve();
        }
        this.muted = new Set();
        this.mutedListeners = new Set();
        this.scan = new WildcardObject(this.data, this.options.delimiter, this.options.wildcard);
        this.destroyed = false;
    }
    getDefaultListenerOptions() {
        return {
            bulk: false,
            bulkValue: this.options.defaultBulkValue,
            debug: false,
            source: "",
            data: undefined,
            queue: false,
            group: false,
        };
    }
    cacheGet(pathChunks, data = this.data, create = false) {
        const path = pathChunks.join(this.options.delimiter);
        const weakRefValue = this.cache.get(path);
        if (weakRefValue) {
            const value = weakRefValue.deref();
            if (value) {
                return value;
            }
        }
        const value = ObjectPath.get(pathChunks, data, create);
        if (isObject(value) || Array.isArray(value)) {
            // @ts-ignore-next-line
            this.cache.set(path, new WeakRef(value));
        }
        return value;
    }
    cacheSet(pathChunks, value, data = this.data) {
        const path = pathChunks.join(this.options.delimiter);
        if (isObject(value) || Array.isArray(value)) {
            this.cache.set(path, 
            //@ts-ignore-next-line
            new WeakRef(value));
        }
        else {
            this.cache.delete(path);
        }
        return ObjectPath.set(pathChunks, value, data);
    }
    /**
     * Silently update data
     * @param path string
     * @param value any
     * @returns
     */
    silentSet(path, value) {
        return this.pathSet(this.split(path), value, this.data);
    }
    loadWasmMatcher(pathToWasmFile) {
        return __awaiter(this, void 0, void 0, function* () {
            yield init(pathToWasmFile);
            this.is_match = is_match;
            this.scan = new WildcardObject(this.data, this.options.delimiter, this.options.wildcard, this.is_match);
        });
    }
    same(newValue, oldValue) {
        return ((["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
            oldValue === newValue);
    }
    getListeners() {
        return this.listeners;
    }
    destroy() {
        this.destroyed = true;
        this.data = undefined;
        this.listeners = new Map();
        this.waitingListeners = new Map();
        this.updateQueue = [];
        this.jobsRunning = 0;
    }
    match(first, second, nested = true) {
        if (this.is_match)
            return this.is_match(first, second);
        if (first === second)
            return true;
        if (first === this.options.wildcard || second === this.options.wildcard)
            return true;
        if (!nested &&
            this.getIndicesCount(this.options.delimiter, first) < this.getIndicesCount(this.options.delimiter, second)) {
            // first < second because first is a listener path and may be longer but not shorter
            return false;
        }
        return this.scan.match(first, second);
    }
    getIndicesOf(searchStr, str) {
        if (this.options.useIndicesCache && this.indices.has(str))
            return this.indices.get(str);
        const searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        let startIndex = 0, index, indices = [];
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        if (this.options.useIndicesCache)
            this.indices.set(str, indices);
        return indices;
    }
    getIndicesCount(searchStr, str) {
        if (this.options.useIndicesCache && this.indicesCount.has(str))
            return this.indicesCount.get(str);
        const searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return 0;
        }
        let startIndex = 0, index, indices = 0;
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices++;
            startIndex = index + searchStrLen;
        }
        if (this.options.useIndicesCache)
            this.indicesCount.set(str, indices);
        return indices;
    }
    cutPath(longer, shorter) {
        if (shorter === "")
            return "";
        longer = this.cleanNotRecursivePath(longer);
        shorter = this.cleanNotRecursivePath(shorter);
        if (longer === shorter)
            return longer;
        const shorterPartsLen = this.getIndicesCount(this.options.delimiter, shorter);
        const longerParts = this.getIndicesOf(this.options.delimiter, longer);
        return longer.substring(0, longerParts[shorterPartsLen]);
    }
    trimPath(path) {
        path = this.cleanNotRecursivePath(path);
        if (path.charAt(0) === this.options.delimiter) {
            return path.substr(1);
        }
        return path;
    }
    split(path) {
        if (path === "")
            return [];
        if (!this.options.useSplitCache) {
            return path.split(this.options.delimiter);
        }
        const fromCache = this.splitCache.get(path);
        if (fromCache) {
            return fromCache.slice();
        }
        const value = path.split(this.options.delimiter);
        this.splitCache.set(path, value.slice());
        return value;
    }
    isWildcard(path) {
        return path.includes(this.options.wildcard) || this.hasParams(path);
    }
    isNotRecursive(path) {
        return path.endsWith(this.options.notRecursive);
    }
    cleanNotRecursivePath(path) {
        return this.isNotRecursive(path) ? path.substring(0, path.length - 1) : path;
    }
    hasParams(path) {
        return path.includes(this.options.param);
    }
    getParamsInfo(path) {
        let paramsInfo = { replaced: "", original: path, params: {} };
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
            }
            else {
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
    getParams(paramsInfo, path) {
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
    waitForAll(userPaths, fn) {
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
    executeWaitingListeners(updatePath) {
        if (this.destroyed)
            return;
        for (const waitingListener of this.waitingListeners.values()) {
            const { fn, paths } = waitingListener;
            let dirty = 0;
            let all = 0;
            for (let path in paths) {
                const pathInfo = paths[path];
                let match = false;
                if (pathInfo.isRecursive)
                    updatePath = this.cutPath(updatePath, path);
                if (pathInfo.isWildcard && this.match(path, updatePath))
                    match = true;
                if (updatePath === path)
                    match = true;
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
    subscribeAll(userPaths, fn, options = this.getDefaultListenerOptions()) {
        if (this.destroyed)
            return () => { };
        let unsubscribers = [];
        let index = 0;
        let groupId = null;
        if (typeof options.group === "boolean" && options.group) {
            this.groupId++;
            groupId = this.groupId;
            options.bulk = true;
        }
        else if (typeof options.group === "string") {
            options.bulk = true;
            groupId = options.group;
        }
        for (const userPath of userPaths) {
            unsubscribers.push(this.subscribe(userPath, fn, options, {
                all: userPaths,
                index,
                groupId,
            }));
            index++;
        }
        return function unsubscribe() {
            for (const unsubscribe of unsubscribers) {
                unsubscribe();
            }
        };
    }
    getCleanListenersCollection(values = {}) {
        return Object.assign({ listeners: new Map(), isRecursive: false, isWildcard: false, hasParams: false, match: undefined, paramsInfo: undefined, path: undefined, originalPath: undefined, count: 0 }, values);
    }
    getCleanListener(fn, options = this.getDefaultListenerOptions()) {
        return {
            fn,
            options: Object.assign(Object.assign({}, this.getDefaultListenerOptions()), options),
            groupId: null,
        };
    }
    getListenerCollectionMatch(listenerPath, isRecursive, isWildcard) {
        listenerPath = this.cleanNotRecursivePath(listenerPath);
        const self = this;
        return function listenerCollectionMatch(path, debug = false) {
            let scopedListenerPath = listenerPath;
            if (isRecursive) {
                path = self.cutPath(path, listenerPath);
            }
            else {
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
            if (isWildcard && self.match(scopedListenerPath, path, isRecursive))
                return true;
            return scopedListenerPath === path;
        };
    }
    getListenersCollection(listenerPath, listener) {
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
        let listenersCollection = this.getCleanListenersCollection(Object.assign(Object.assign({}, collCfg), { match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard) }));
        this.id++;
        listenersCollection.listeners.set(this.id, listener);
        listener.id = this.id;
        this.listeners.set(collCfg.originalPath, listenersCollection);
        return listenersCollection;
    }
    subscribe(listenerPath, fn, options = this.getDefaultListenerOptions(), subscribeAllOptions = {
        all: [listenerPath],
        index: 0,
        groupId: null,
    }) {
        if (this.destroyed)
            return () => { };
        this.jobsRunning++;
        const type = "subscribe";
        let listener = this.getCleanListener(fn, options);
        if (options.group) {
            options.bulk = true;
            if (typeof options.group === "string") {
                listener.groupId = options.group;
            }
            else if (subscribeAllOptions.groupId) {
                listener.groupId = subscribeAllOptions.groupId;
            }
        }
        this.listenersIgnoreCache.set(listener, { truthy: [], falsy: [] });
        const listenersCollection = this.getListenersCollection(listenerPath, listener);
        if (options.debug) {
            console.log("[subscribe]", { listenerPath, options });
        }
        listenersCollection.count++;
        let shouldFire = true;
        if (listener.groupId) {
            if (typeof listener.groupId === "string") {
                if (this.namedGroups.includes(listener.groupId)) {
                    shouldFire = false;
                }
                else {
                    this.namedGroups.push(listener.groupId);
                }
            }
            else if (typeof listener.groupId === "number") {
                if (this.numberGroups.includes(listener.groupId)) {
                    shouldFire = false;
                }
                else {
                    this.numberGroups.push(listener.groupId);
                }
            }
        }
        if (shouldFire) {
            const cleanPath = this.cleanNotRecursivePath(listenersCollection.path);
            const cleanPathChunks = this.split(cleanPath);
            if (!listenersCollection.isWildcard) {
                if (!this.isMuted(cleanPath) && !this.isMuted(fn)) {
                    fn(this.pathGet(cleanPathChunks, this.data), {
                        type,
                        listener,
                        listenersCollection,
                        path: {
                            listener: listenerPath,
                            update: undefined,
                            resolved: this.cleanNotRecursivePath(listenerPath),
                        },
                        params: this.getParams(listenersCollection.paramsInfo, cleanPath),
                        options,
                    });
                }
            }
            else {
                const paths = this.scan.get(cleanPath);
                if (options.bulk) {
                    const bulkValue = [];
                    for (const path in paths) {
                        if (this.isMuted(path))
                            continue;
                        bulkValue.push({
                            path,
                            params: this.getParams(listenersCollection.paramsInfo, path),
                            value: paths[path],
                        });
                    }
                    if (!this.isMuted(fn)) {
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
                    }
                }
                else {
                    for (const path in paths) {
                        if (!this.isMuted(path) && !this.isMuted(fn)) {
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
            }
        }
        this.debugSubscribe(listener, listenersCollection, listenerPath);
        this.jobsRunning--;
        return this.unsubscribe(listenerPath, this.id);
    }
    unsubscribe(path, id) {
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
    runQueuedListeners() {
        if (this.destroyed)
            return;
        if (this.subscribeQueue.length === 0)
            return;
        if (this.jobsRunning === 0) {
            this.queueRuns = 0;
            const queue = [...this.subscribeQueue];
            for (let i = 0, len = queue.length; i < len; i++) {
                queue[i]();
            }
            this.subscribeQueue.length = 0;
        }
        else {
            this.queueRuns++;
            if (this.queueRuns >= this.options.maxQueueRuns) {
                this.queueRuns = 0;
                throw new Error("Maximal number of queue runs exhausted.");
            }
            else {
                Promise.resolve()
                    .then(() => this.runQueuedListeners())
                    .catch((e) => {
                    throw e;
                });
            }
        }
    }
    getQueueNotifyListeners(groupedListeners, queue = []) {
        for (const path in groupedListeners) {
            if (this.isMuted(path))
                continue;
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
                    if (singleListener.listener.options.queue && this.jobsRunning) {
                        this.subscribeQueue.push(() => {
                            singleListener.listener.fn(singleListener.value ? singleListener.value() : undefined, singleListener.eventInfo);
                        });
                    }
                    else {
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
                                singleListener.listener.fn(singleListener.value ? singleListener.value() : undefined, singleListener.eventInfo);
                            },
                            options: singleListener.listener.options,
                            groupId: singleListener.listener.groupId,
                        });
                    }
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
                if (alreadyInQueue)
                    continue;
                const time = this.debugTime(bulkListener);
                const bulkValue = [];
                for (const bulk of bulkListener.value) {
                    bulkValue.push(Object.assign(Object.assign({}, bulk), { value: bulk.value ? bulk.value() : undefined }));
                }
                if (!this.isMuted(bulkListener.listener.fn)) {
                    if (bulkListener.listener.options.queue && this.jobsRunning) {
                        this.subscribeQueue.push(() => {
                            if (!this.jobsRunning) {
                                bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
                                return true;
                            }
                            return false;
                        });
                    }
                    else {
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
                }
                this.debugListener(time, bulkListener);
            }
        }
        Promise.resolve().then(() => this.runQueuedListeners());
        return queue;
    }
    shouldIgnore(listener, updatePath) {
        if (!listener.options.ignore)
            return false;
        for (const ignorePath of listener.options.ignore) {
            if (updatePath.startsWith(ignorePath)) {
                return true;
            }
            if (this.is_match && this.is_match(ignorePath, updatePath)) {
                return true;
            }
            else {
                const cuttedUpdatePath = this.cutPath(updatePath, ignorePath);
                if (this.match(ignorePath, cuttedUpdatePath)) {
                    return true;
                }
            }
        }
        return false;
    }
    getSubscribedListeners(updatePath, newValue, options, type = "update", originalPath = null) {
        options = Object.assign(Object.assign({}, defaultUpdateOptions), options);
        const listeners = {};
        for (let [listenerPath, listenersCollection] of this.listeners) {
            if (listenersCollection.match(updatePath)) {
                listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
                const params = listenersCollection.paramsInfo
                    ? this.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                const cutPath = this.cutPath(updatePath, listenerPath);
                const traverse = listenersCollection.isRecursive || listenersCollection.isWildcard;
                const value = traverse ? () => this.get(cutPath) : () => newValue;
                const bulkValue = [{ value, path: updatePath, params }];
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
                    }
                    else {
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
            else if (this.options.extraDebug) {
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
    notifySubscribedListeners(updatePath, newValue, options, type = "update", originalPath = null) {
        return this.getQueueNotifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
    }
    useBulkValue(listenersCollection) {
        for (const [listenerId, listener] of listenersCollection.listeners) {
            if (listener.options.bulk && listener.options.bulkValue)
                return true;
            if (!listener.options.bulk)
                return true;
        }
        return false;
    }
    getNestedListeners(updatePath, newValue, options, type = "update", originalPath = null) {
        const listeners = {};
        const restBelowValues = {};
        for (let [listenerPath, listenersCollection] of this.listeners) {
            if (!listenersCollection.isRecursive)
                continue;
            // listenerPath may be longer and is shortened - because we want to get listeners underneath change
            const currentAbovePathCut = this.cutPath(listenerPath, updatePath);
            if (this.match(currentAbovePathCut, updatePath)) {
                listeners[listenerPath] = { single: [], bulk: [] };
                // listener is listening below updated node
                const restBelowPathCut = this.trimPath(listenerPath.substr(currentAbovePathCut.length));
                const useBulkValue = this.useBulkValue(listenersCollection);
                let wildcardNewValues;
                if (useBulkValue) {
                    wildcardNewValues = restBelowValues[restBelowPathCut]
                        ? restBelowValues[restBelowPathCut] // if those values are already calculated use it
                        : new WildcardObject(newValue, this.options.delimiter, this.options.wildcard).get(restBelowPathCut);
                    restBelowValues[restBelowPathCut] = wildcardNewValues;
                }
                const params = listenersCollection.paramsInfo
                    ? this.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                const bulk = [];
                const bulkListeners = {};
                for (const [listenerId, listener] of listenersCollection.listeners) {
                    if (useBulkValue) {
                        for (const currentRestPath in wildcardNewValues) {
                            const value = () => wildcardNewValues[currentRestPath];
                            const fullPath = [updatePath, currentRestPath].join(this.options.delimiter);
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
                            if (this.shouldIgnore(listener, updatePath))
                                continue;
                            if (listener.options.bulk) {
                                bulk.push({ value, path: fullPath, params });
                                bulkListeners[listenerId] = listener;
                            }
                            else {
                                listeners[listenerPath].single.push({
                                    listener,
                                    listenersCollection,
                                    eventInfo,
                                    value,
                                });
                            }
                        }
                    }
                    else {
                        const eventInfo = {
                            type,
                            listener,
                            listenersCollection,
                            path: {
                                listener: listenerPath,
                                update: originalPath ? originalPath : updatePath,
                                resolved: undefined,
                            },
                            params,
                            options,
                        };
                        if (this.shouldIgnore(listener, updatePath))
                            continue;
                        if (listener.options.bulk) {
                            bulk.push({ value: undefined, path: undefined, params });
                            bulkListeners[listenerId] = listener;
                        }
                        else {
                            listeners[listenerPath].single.push({
                                listener,
                                listenersCollection,
                                eventInfo,
                                value: undefined,
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
            }
            else if (this.options.extraDebug) {
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
    notifyNestedListeners(updatePath, newValue, options, type = "update", queue, originalPath = null) {
        return this.getQueueNotifyListeners(this.getNestedListeners(updatePath, newValue, options, type, originalPath), queue);
    }
    getNotifyOnlyListeners(updatePath, newValue, options, type = "update", originalPath = null) {
        const listeners = {};
        if (typeof options.only !== "object" ||
            !Array.isArray(options.only) ||
            typeof options.only[0] === "undefined" ||
            !this.canBeNested(newValue)) {
            return listeners;
        }
        for (const notifyPath of options.only) {
            const wildcardScanNewValue = new WildcardObject(newValue, this.options.delimiter, this.options.wildcard).get(notifyPath);
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
                            if (this.shouldIgnore(listener, updatePath))
                                continue;
                            if (listener.options.bulk) {
                                if (!listeners[notifyPath].bulk.some((bulkListener) => bulkListener.listener === listener)) {
                                    listeners[notifyPath].bulk.push({
                                        listener,
                                        listenersCollection,
                                        eventInfo,
                                        value: bulkValue,
                                    });
                                }
                            }
                            else {
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
    runQueue(queue) {
        const firedGroups = [];
        for (const q of queue) {
            if (q.options.group) {
                if (!firedGroups.includes(q.groupId)) {
                    q.fn();
                    firedGroups.push(q.groupId);
                }
            }
            else {
                q.fn();
            }
        }
    }
    sortAndRunQueue(queue, path) {
        queue.sort(function (a, b) {
            return a.id - b.id;
        });
        if (this.options.debug) {
            console.log(`[deep-state-observer] queue for ${path}`, queue);
        }
        this.runQueue(queue);
    }
    notifyOnly(updatePath, newValue, options, type = "update", originalPath = "") {
        const queue = this.getQueueNotifyListeners(this.getNotifyOnlyListeners(updatePath, newValue, options, type, originalPath));
        this.sortAndRunQueue(queue, updatePath);
    }
    canBeNested(newValue) {
        return typeof newValue === "object" && newValue !== null;
    }
    getUpdateValues(oldValue, fn) {
        let newValue = fn;
        if (typeof fn === "function") {
            newValue = fn(oldValue);
        }
        return { newValue, oldValue };
    }
    wildcardNotify(groupedListenersPack, waitingPaths) {
        let queue = [];
        for (const groupedListeners of groupedListenersPack) {
            this.getQueueNotifyListeners(groupedListeners, queue);
        }
        for (const path of waitingPaths) {
            this.executeWaitingListeners(path);
        }
        this.jobsRunning--;
        return queue;
    }
    wildcardUpdate(updatePath, fn, options = defaultUpdateOptions, multi = false) {
        ++this.jobsRunning;
        options = Object.assign(Object.assign({}, defaultUpdateOptions), options);
        const scanned = this.scan.get(updatePath);
        const updated = {};
        for (const path in scanned) {
            const split = this.split(path);
            const { oldValue, newValue } = this.getUpdateValues(scanned[path], fn);
            if (!this.same(newValue, oldValue) || options.force) {
                this.pathSet(split, newValue, this.data);
                updated[path] = newValue;
            }
        }
        const groupedListenersPack = [];
        const waitingPaths = [];
        for (const path in updated) {
            const newValue = updated[path];
            if (options.only.length) {
                groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, options, "update", updatePath));
            }
            else {
                groupedListenersPack.push(this.getSubscribedListeners(path, newValue, options, "update", updatePath));
                if (this.canBeNested(newValue)) {
                    groupedListenersPack.push(this.getNestedListeners(path, newValue, options, "update", updatePath));
                }
            }
            options.debug && this.options.log("Wildcard update", { path, newValue });
            waitingPaths.push(path);
        }
        if (multi) {
            const self = this;
            return function () {
                const queue = self.wildcardNotify(groupedListenersPack, waitingPaths);
                self.sortAndRunQueue(queue, updatePath);
            };
        }
        const queue = this.wildcardNotify(groupedListenersPack, waitingPaths);
        this.sortAndRunQueue(queue, updatePath);
    }
    runUpdateQueue() {
        if (this.destroyed)
            return;
        while (this.updateQueue.length && this.updateQueue.length < this.options.maxSimultaneousJobs) {
            const params = this.updateQueue.shift();
            params.options.queue = false; // prevent infinite loop
            this.update(params.updatePath, params.fnOrValue, params.options, params.multi);
        }
    }
    updateNotify(updatePath, newValue, options) {
        const queue = this.notifySubscribedListeners(updatePath, newValue, options);
        if (this.canBeNested(newValue)) {
            this.notifyNestedListeners(updatePath, newValue, options, "update", queue);
        }
        this.sortAndRunQueue(queue, updatePath);
        this.executeWaitingListeners(updatePath);
    }
    updateNotifyAll(updateStack) {
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
    updateNotifyOnly(updatePath, newValue, options) {
        this.notifyOnly(updatePath, newValue, options);
        this.executeWaitingListeners(updatePath);
    }
    update(updatePath, fnOrValue, options = Object.assign({}, defaultUpdateOptions), multi = false) {
        if (this.destroyed)
            return;
        if (this.collection) {
            return this.collection.update(updatePath, fnOrValue, options);
        }
        if (this.tracing.length) {
            const traceId = this.tracing[this.tracing.length - 1];
            const trace = this.traceMap.get(traceId);
            trace.changed.push({ traceId, updatePath, fnOrValue, options });
            this.traceMap.set(traceId, trace);
        }
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
                return function () {
                    return result;
                };
            }
            return result;
        }
        if (this.isWildcard(updatePath)) {
            return this.wildcardUpdate(updatePath, fnOrValue, options, multi);
        }
        ++this.jobsRunning;
        const split = this.split(updatePath);
        const currentValue = this.pathGet(split, this.data);
        let { oldValue, newValue } = this.getUpdateValues(currentValue, fnOrValue);
        if (options.debug) {
            this.options.log(`Updating ${updatePath} ${options.source ? `from ${options.source}` : ""}`, {
                oldValue,
                newValue,
            });
        }
        if (this.same(newValue, oldValue) && !options.force) {
            --this.jobsRunning;
            if (multi)
                return function () {
                    return newValue;
                };
            return newValue;
        }
        this.pathSet(split, newValue, this.data);
        options = Object.assign(Object.assign({}, defaultUpdateOptions), options);
        if (options.only === null) {
            --this.jobsRunning;
            if (multi)
                return function () { };
            return newValue;
        }
        if (options.only.length) {
            --this.jobsRunning;
            if (multi) {
                const self = this;
                return function () {
                    const result = self.updateNotifyOnly(updatePath, newValue, options);
                    return result;
                };
            }
            this.updateNotifyOnly(updatePath, newValue, options);
            return newValue;
        }
        if (multi) {
            --this.jobsRunning;
            const self = this;
            return function multiUpdate() {
                const result = self.updateNotify(updatePath, newValue, options);
                return result;
            };
        }
        this.updateNotify(updatePath, newValue, options);
        --this.jobsRunning;
        return newValue;
    }
    multi(grouped = false) {
        if (this.destroyed)
            return {
                update() {
                    return this;
                },
                done() { },
                getStack() {
                    return [];
                },
            };
        if (this.collection)
            return this.collection;
        const self = this;
        const updateStack = [];
        const notifiers = [];
        const multiObject = {
            update(updatePath, fnOrValue, options = defaultUpdateOptions) {
                if (grouped) {
                    const split = self.split(updatePath);
                    let value = fnOrValue;
                    const currentValue = self.pathGet(split, self.data);
                    if (typeof value === "function") {
                        value = value(currentValue);
                    }
                    self.pathSet(split, value, self.data);
                    updateStack.push({ updatePath, newValue: value, options });
                }
                else {
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
                }
                else {
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
    collect() {
        this.collections++;
        if (!this.collection) {
            this.collection = this.multi(true);
        }
        return this.collection;
    }
    executeCollected() {
        this.collections--;
        if (this.collections === 0 && this.collection) {
            const collection = this.collection;
            this.collection = null;
            collection.done();
        }
    }
    getCollectedCount() {
        return this.collections;
    }
    getCollectedStack() {
        if (!this.collection)
            return [];
        return this.collection.getStack();
    }
    get(userPath = undefined) {
        if (this.destroyed)
            return;
        if (userPath === undefined || userPath === "") {
            return this.data;
        }
        if (this.isWildcard(userPath)) {
            return this.scan.get(userPath);
        }
        return this.pathGet(this.split(userPath), this.data);
    }
    last(callback) {
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
    isMuted(pathOrListenerFunction) {
        if (!this.options.useMute)
            return false;
        if (typeof pathOrListenerFunction === "function") {
            return this.isMutedListener(pathOrListenerFunction);
        }
        for (const mutedPath of this.muted) {
            const recursive = !this.isNotRecursive(mutedPath);
            const trimmedMutedPath = this.trimPath(mutedPath);
            if (this.match(pathOrListenerFunction, trimmedMutedPath))
                return true;
            if (this.match(trimmedMutedPath, pathOrListenerFunction))
                return true;
            if (recursive) {
                const cutPath = this.cutPath(trimmedMutedPath, pathOrListenerFunction);
                if (this.match(cutPath, mutedPath))
                    return true;
                if (this.match(mutedPath, cutPath))
                    return true;
            }
        }
        return false;
    }
    isMutedListener(listenerFunc) {
        return this.mutedListeners.has(listenerFunc);
    }
    mute(pathOrListenerFunction) {
        if (typeof pathOrListenerFunction === "function") {
            return this.mutedListeners.add(pathOrListenerFunction);
        }
        this.muted.add(pathOrListenerFunction);
    }
    unmute(pathOrListenerFunction) {
        if (typeof pathOrListenerFunction === "function") {
            return this.mutedListeners.delete(pathOrListenerFunction);
        }
        this.muted.delete(pathOrListenerFunction);
    }
    debugSubscribe(listener, listenersCollection, listenerPath) {
        if (listener.options.debug) {
            this.options.log("listener subscribed", {
                listenerPath,
                listener,
                listenersCollection,
            });
        }
    }
    debugListener(time, groupedListener) {
        if (groupedListener.eventInfo.options.debug || groupedListener.listener.options.debug) {
            this.options.log("Listener fired", {
                time: Date.now() - time,
                info: groupedListener,
            });
        }
    }
    debugTime(groupedListener) {
        return groupedListener.listener.options.debug || groupedListener.eventInfo.options.debug ? Date.now() : 0;
    }
    startTrace(name, additionalData = null) {
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
    stopTrace(id) {
        const result = this.traceMap.get(id);
        this.tracing.pop();
        this.traceMap.delete(id);
        return result;
    }
    saveTrace(id) {
        const result = this.traceMap.get(id);
        this.tracing.pop();
        this.traceMap.delete(id);
        this.savedTrace.push(result);
        return result;
    }
    getSavedTraces() {
        const savedTrace = this.savedTrace.map((trace) => trace);
        savedTrace.sort((a, b) => {
            return a.sort - b.sort;
        });
        this.savedTrace = [];
        return savedTrace;
    }
}

export { DeepState as default };
