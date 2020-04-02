(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global['svelte-deep-store'] = {}));
}(this, (function (exports) { 'use strict';

    // forked from https://github.com/joonhocho/superwild
    function Matcher(pattern, wchar = '*') {
        this.wchar = wchar;
        this.pattern = pattern;
        this.segments = [];
        this.starCount = 0;
        this.minLength = 0;
        this.maxLength = 0;
        this.segStartIndex = 0;
        for (let i = 0, len = pattern.length; i < len; i += 1) {
            const char = pattern[i];
            if (char === wchar) {
                this.starCount += 1;
                if (i > this.segStartIndex) {
                    this.segments.push(pattern.substring(this.segStartIndex, i));
                }
                this.segments.push(char);
                this.segStartIndex = i + 1;
            }
        }
        if (this.segStartIndex < pattern.length) {
            this.segments.push(pattern.substring(this.segStartIndex));
        }
        if (this.starCount) {
            this.minLength = pattern.length - this.starCount;
            this.maxLength = Infinity;
        }
        else {
            this.maxLength = this.minLength = pattern.length;
        }
    }
    Matcher.prototype.match = function match(match) {
        if (this.pattern === this.wchar) {
            return true;
        }
        if (this.segments.length === 0) {
            return this.pattern === match;
        }
        const { length } = match;
        if (length < this.minLength || length > this.maxLength) {
            return false;
        }
        let segLeftIndex = 0;
        let segRightIndex = this.segments.length - 1;
        let rightPos = match.length - 1;
        let rightIsStar = false;
        while (true) {
            const segment = this.segments[segRightIndex];
            segRightIndex -= 1;
            if (segment === this.wchar) {
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
    };

    function WildcardObject(obj, delimeter, wildcard) {
        this.obj = obj;
        this.delimeter = delimeter;
        this.wildcard = wildcard;
    }
    WildcardObject.prototype.simpleMatch = function simpleMatch(first, second) {
        if (first === second)
            return true;
        if (first === this.wildcard)
            return true;
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
    };
    WildcardObject.prototype.match = function match(first, second) {
        return (first === second ||
            first === this.wildcard ||
            second === this.wildcard ||
            this.simpleMatch(first, second) ||
            new Matcher(first).match(second));
    };
    WildcardObject.prototype.handleArray = function handleArray(wildcard, currentArr, partIndex, path, result = {}) {
        let nextPartIndex = wildcard.indexOf(this.delimeter, partIndex);
        let end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcard.length;
        }
        const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
        let index = 0;
        for (const item of currentArr) {
            const key = index.toString();
            const currentPath = path === '' ? key : path + this.delimeter + index;
            if (currentWildcardPath === this.wildcard ||
                currentWildcardPath === key ||
                this.simpleMatch(currentWildcardPath, key)) {
                end ? (result[currentPath] = item) : this.goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
            }
            index++;
        }
        return result;
    };
    WildcardObject.prototype.handleObject = function handleObject(wildcard, currentObj, partIndex, path, result = {}) {
        let nextPartIndex = wildcard.indexOf(this.delimeter, partIndex);
        let end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcard.length;
        }
        const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
        for (let key in currentObj) {
            key = key.toString();
            const currentPath = path === '' ? key : path + this.delimeter + key;
            if (currentWildcardPath === this.wildcard ||
                currentWildcardPath === key ||
                this.simpleMatch(currentWildcardPath, key)) {
                end
                    ? (result[currentPath] = currentObj[key])
                    : this.goFurther(wildcard, currentObj[key], nextPartIndex + 1, currentPath, result);
            }
        }
        return result;
    };
    WildcardObject.prototype.goFurther = function goFurther(wildcard, currentObj, partIndex, currentPath, result = {}) {
        if (Array.isArray(currentObj)) {
            return this.handleArray(wildcard, currentObj, partIndex, currentPath, result);
        }
        return this.handleObject(wildcard, currentObj, partIndex, currentPath, result);
    };
    WildcardObject.prototype.get = function get(wildcard) {
        return this.goFurther(wildcard, this.obj, 0, '');
    };

    class ObjectPath {
        static get(path, obj, copiedPath = null) {
            if (copiedPath === null) {
                copiedPath = path.slice();
            }
            if (copiedPath.length === 0 || typeof obj === "undefined") {
                return obj;
            }
            const currentPath = copiedPath.shift();
            if (!obj.hasOwnProperty(currentPath)) {
                return undefined;
            }
            if (copiedPath.length === 0) {
                return obj[currentPath];
            }
            return ObjectPath.get(path, obj[currentPath], copiedPath);
        }
        static set(path, newValue, obj, copiedPath = null) {
            if (copiedPath === null) {
                copiedPath = path.slice();
            }
            if (copiedPath.length === 0) {
                for (const key in obj) {
                    delete obj[key];
                }
                for (const key in newValue) {
                    obj[key] = newValue[key];
                }
                return;
            }
            const currentPath = copiedPath.shift();
            if (copiedPath.length === 0) {
                obj[currentPath] = newValue;
                return;
            }
            if (!obj) {
                obj = {};
            }
            if (!obj.hasOwnProperty(currentPath)) {
                obj[currentPath] = {};
            }
            ObjectPath.set(path, newValue, obj[currentPath], copiedPath);
        }
    }

    function log(message, info) {
        console.debug(message, info);
    }
    const defaultOptions = {
        delimeter: `.`,
        notRecursive: `;`,
        param: `:`,
        wildcard: `*`,
        queue: false,
        maxSimultaneousJobs: 1000,
        log
    };
    const defaultListenerOptions = {
        bulk: false,
        debug: false,
        source: "",
        data: undefined,
        queue: false
    };
    const defaultUpdateOptions = {
        only: [],
        source: "",
        debug: false,
        data: undefined,
        queue: false
    };
    class DeepState {
        constructor(data = {}, options = defaultOptions) {
            this.jobsRunning = 0;
            this.updateQueue = [];
            this.subscribeQueue = [];
            this.listeners = new Map();
            this.waitingListeners = new Map();
            this.data = data;
            this.options = Object.assign({}, defaultOptions, options);
            this.id = 0;
            this.pathGet = ObjectPath.get;
            this.pathSet = ObjectPath.set;
            this.scan = new WildcardObject(this.data, this.options.delimeter, this.options.wildcard);
        }
        getListeners() {
            return this.listeners;
        }
        destroy() {
            this.data = undefined;
            this.listeners = new Map();
        }
        match(first, second) {
            if (first === second)
                return true;
            if (first === this.options.wildcard || second === this.options.wildcard)
                return true;
            return this.scan.match(first, second);
        }
        getIndicesOf(searchStr, str) {
            const searchStrLen = searchStr.length;
            if (searchStrLen == 0) {
                return [];
            }
            let startIndex = 0, index, indices = [];
            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + searchStrLen;
            }
            return indices;
        }
        getIndicesCount(searchStr, str) {
            const searchStrLen = searchStr.length;
            if (searchStrLen == 0) {
                return 0;
            }
            let startIndex = 0, index, indices = 0;
            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                indices++;
                startIndex = index + searchStrLen;
            }
            return indices;
        }
        cutPath(longer, shorter) {
            longer = this.cleanNotRecursivePath(longer);
            shorter = this.cleanNotRecursivePath(shorter);
            const shorterPartsLen = this.getIndicesCount(this.options.delimeter, shorter);
            const longerParts = this.getIndicesOf(this.options.delimeter, longer);
            return longer.substr(0, longerParts[shorterPartsLen]);
        }
        trimPath(path) {
            path = this.cleanNotRecursivePath(path);
            if (path.charAt(0) === this.options.delimeter) {
                return path.substr(1);
            }
            return path;
        }
        split(path) {
            return path === "" ? [] : path.split(this.options.delimeter);
        }
        isWildcard(path) {
            return path.includes(this.options.wildcard);
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
                    name: ""
                };
                const reg = new RegExp(`\\${this.options.param}([^\\${this.options.delimeter}\\${this.options.param}]+)`, "g");
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
            paramsInfo.replaced = fullReplaced.join(this.options.delimeter);
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
        subscribeAll(userPaths, fn, options = defaultListenerOptions) {
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
        getCleanListenersCollection(values = {}) {
            return Object.assign({ listeners: new Map(), isRecursive: false, isWildcard: false, hasParams: false, match: undefined, paramsInfo: undefined, path: undefined, count: 0 }, values);
        }
        getCleanListener(fn, options = defaultListenerOptions) {
            return {
                fn,
                options: Object.assign({}, defaultListenerOptions, options)
            };
        }
        getListenerCollectionMatch(listenerPath, isRecursive, isWildcard) {
            listenerPath = this.cleanNotRecursivePath(listenerPath);
            const self = this;
            return function listenerCollectionMatch(path) {
                if (isRecursive)
                    path = self.cutPath(path, listenerPath);
                if (isWildcard && self.match(listenerPath, path))
                    return true;
                return listenerPath === path;
            };
        }
        getListenersCollection(listenerPath, listener) {
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
            let listenersCollection = this.getCleanListenersCollection(Object.assign({}, collCfg, { match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard) }));
            this.id++;
            listenersCollection.listeners.set(this.id, listener);
            this.listeners.set(collCfg.path, listenersCollection);
            return listenersCollection;
        }
        subscribe(listenerPath, fn, options = defaultListenerOptions, type = "subscribe") {
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
                        resolved: this.cleanNotRecursivePath(listenerPath)
                    },
                    params: this.getParams(listenersCollection.paramsInfo, listenerPath),
                    options
                });
            }
            else {
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
                }
                else {
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
        same(newValue, oldValue) {
            return ((["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
                oldValue === newValue);
        }
        runQueuedListeners() {
            if (this.subscribeQueue.length === 0)
                return;
            const queue = [...this.subscribeQueue];
            for (let i = 0, len = queue.length; i < len; i++) {
                const remove = queue[i]();
                if (remove) {
                    const index = this.subscribeQueue.indexOf(queue[i]);
                    if (index > -1) {
                        this.subscribeQueue.splice(index, 1);
                    }
                }
            }
            Promise.resolve().then(() => this.runQueuedListeners());
        }
        notifyListeners(listeners, exclude = [], returnNotified = true) {
            const alreadyNotified = [];
            for (const path in listeners) {
                let { single, bulk } = listeners[path];
                for (const singleListener of single) {
                    if (exclude.includes(singleListener))
                        continue;
                    const time = this.debugTime(singleListener);
                    if (singleListener.listener.options.queue && this.jobsRunning) {
                        this.subscribeQueue.push(() => {
                            if (!this.jobsRunning) {
                                singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
                                return true;
                            }
                            return false;
                        });
                    }
                    else {
                        singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
                    }
                    if (returnNotified)
                        alreadyNotified.push(singleListener);
                    this.debugListener(time, singleListener);
                }
                for (const bulkListener of bulk) {
                    if (exclude.includes(bulkListener))
                        continue;
                    const time = this.debugTime(bulkListener);
                    const bulkValue = [];
                    for (const bulk of bulkListener.value) {
                        bulkValue.push(Object.assign({}, bulk, { value: bulk.value() }));
                    }
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
                        bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
                    }
                    if (returnNotified)
                        alreadyNotified.push(bulkListener);
                    this.debugListener(time, bulkListener);
                }
            }
            Promise.resolve().then(() => this.runQueuedListeners());
            return alreadyNotified;
        }
        getSubscribedListeners(updatePath, newValue, options, type = "update", originalPath = null) {
            options = Object.assign({}, defaultUpdateOptions, options);
            const listeners = {};
            for (let [listenerPath, listenersCollection] of this.listeners) {
                listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
                if (listenersCollection.match(updatePath)) {
                    const params = listenersCollection.paramsInfo
                        ? this.getParams(listenersCollection.paramsInfo, updatePath)
                        : undefined;
                    const value = listenersCollection.isRecursive || listenersCollection.isWildcard
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
        notifySubscribedListeners(updatePath, newValue, options, type = "update", originalPath = null) {
            return this.notifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
        }
        getNestedListeners(updatePath, newValue, options, type = "update", originalPath = null) {
            const listeners = {};
            for (let [listenerPath, listenersCollection] of this.listeners) {
                listeners[listenerPath] = { single: [], bulk: [] };
                const currentCuttedPath = this.cutPath(listenerPath, updatePath);
                if (this.match(currentCuttedPath, updatePath)) {
                    const restPath = this.trimPath(listenerPath.substr(currentCuttedPath.length));
                    const values = new WildcardObject(newValue, this.options.delimeter, this.options.wildcard).get(restPath);
                    const params = listenersCollection.paramsInfo
                        ? this.getParams(listenersCollection.paramsInfo, updatePath)
                        : undefined;
                    const bulk = [];
                    const bulkListeners = {};
                    for (const currentRestPath in values) {
                        const value = () => values[currentRestPath];
                        const fullPath = [updatePath, currentRestPath].join(this.options.delimeter);
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
                            }
                            else {
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
        notifyNestedListeners(updatePath, newValue, options, type = "update", alreadyNotified, originalPath = null) {
            return this.notifyListeners(this.getNestedListeners(updatePath, newValue, options, type, originalPath), alreadyNotified, false);
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
                const wildcardScan = new WildcardObject(newValue, this.options.delimeter, this.options.wildcard).get(notifyPath);
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
                                    if (!listeners[notifyPath].bulk.some(bulkListener => bulkListener.listener === listener)) {
                                        listeners[notifyPath].bulk.push({
                                            listener,
                                            listenersCollection,
                                            eventInfo,
                                            value: bulkValue
                                        });
                                    }
                                }
                                else {
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
        notifyOnly(updatePath, newValue, options, type = "update", originalPath = "") {
            return (typeof this.notifyListeners(this.getNotifyOnlyListeners(updatePath, newValue, options, type, originalPath))[0] !==
                "undefined");
        }
        canBeNested(newValue) {
            return typeof newValue === "object" && newValue !== null;
        }
        getUpdateValues(oldValue, split, fn) {
            if (typeof oldValue === "object" && oldValue !== null) {
                Array.isArray(oldValue) ? (oldValue = oldValue.slice()) : (oldValue = Object.assign({}, oldValue));
            }
            let newValue = fn;
            if (typeof fn === "function") {
                newValue = fn(this.pathGet(split, this.data));
            }
            return { newValue, oldValue };
        }
        wildcardUpdate(updatePath, fn, options = defaultUpdateOptions) {
            options = Object.assign({}, defaultUpdateOptions, options);
            const scanned = this.scan.get(updatePath);
            const bulk = {};
            for (const path in scanned) {
                const split = this.split(path);
                const { oldValue, newValue } = this.getUpdateValues(scanned[path], split, fn);
                if (!this.same(newValue, oldValue))
                    bulk[path] = newValue;
            }
            const groupedListenersPack = [];
            const waitingPaths = [];
            for (const path in bulk) {
                const newValue = bulk[path];
                if (options.only.length) {
                    groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, options, "update", updatePath));
                }
                else {
                    groupedListenersPack.push(this.getSubscribedListeners(path, newValue, options, "update", updatePath));
                    this.canBeNested(newValue) &&
                        groupedListenersPack.push(this.getNestedListeners(path, newValue, options, "update", updatePath));
                }
                options.debug && this.options.log("Wildcard update", { path, newValue });
                this.pathSet(this.split(path), newValue, this.data);
                waitingPaths.push(path);
            }
            let alreadyNotified = [];
            for (const groupedListeners of groupedListenersPack) {
                alreadyNotified = [...alreadyNotified, ...this.notifyListeners(groupedListeners, alreadyNotified)];
            }
            for (const path of waitingPaths) {
                this.executeWaitingListeners(path);
            }
            this.jobsRunning--;
        }
        runUpdateQueue() {
            while (this.updateQueue.length) {
                const params = this.updateQueue.shift();
                this.update(params.updatePath, params.fn, params.options);
            }
        }
        updateNotify(updatePath, newValue, options) {
            const alreadyNotified = this.notifySubscribedListeners(updatePath, newValue, options);
            if (this.canBeNested(newValue)) {
                this.notifyNestedListeners(updatePath, newValue, options, "update", alreadyNotified);
            }
            this.executeWaitingListeners(updatePath);
            this.jobsRunning--;
        }
        update(updatePath, fn, options = defaultUpdateOptions, multi = false) {
            const jobsRunning = this.jobsRunning;
            if ((this.options.queue || options.queue) && jobsRunning) {
                if (jobsRunning > this.options.maxSimultaneousJobs) {
                    throw new Error("Maximal simultaneous jobs limit reached.");
                }
                this.updateQueue.push({ updatePath, fn, options });
                return Promise.resolve().then(() => {
                    this.runUpdateQueue();
                });
            }
            this.jobsRunning++;
            if (this.isWildcard(updatePath)) {
                return this.wildcardUpdate(updatePath, fn, options);
            }
            const split = this.split(updatePath);
            const { oldValue, newValue } = this.getUpdateValues(this.pathGet(split, this.data), split, fn);
            if (options.debug) {
                this.options.log(`Updating ${updatePath} ${options.source ? `from ${options.source}` : ""}`, {
                    oldValue,
                    newValue
                });
            }
            if (this.same(newValue, oldValue)) {
                this.jobsRunning--;
                return newValue;
            }
            this.pathSet(split, newValue, this.data);
            options = Object.assign({}, defaultUpdateOptions, options);
            if (options.only === null) {
                this.jobsRunning--;
                return newValue;
            }
            if (options.only.length) {
                this.notifyOnly(updatePath, newValue, options);
                this.executeWaitingListeners(updatePath);
                this.jobsRunning--;
                return newValue;
            }
            if (multi) {
                return () => this.updateNotify(updatePath, newValue, options);
            }
            this.updateNotify(updatePath, newValue, options);
            return newValue;
        }
        multi() {
            const self = this;
            const notifiers = [];
            const multiObject = {
                update(updatePath, fn, options = defaultUpdateOptions) {
                    notifiers.push(self.update(updatePath, fn, options, true));
                    return this;
                },
                done() {
                    for (let i = 0, len = notifiers.length; i < len; i++) {
                        notifiers[i]();
                    }
                    notifiers.length = 0;
                }
            };
            return multiObject;
        }
        get(userPath = undefined) {
            if (typeof userPath === "undefined" || userPath === "") {
                return this.data;
            }
            return this.pathGet(this.split(userPath), this.data);
        }
        debugSubscribe(listener, listenersCollection, listenerPath) {
            if (listener.options.debug) {
                this.options.log("listener subscribed", {
                    listenerPath,
                    listener,
                    listenersCollection
                });
            }
        }
        debugListener(time, groupedListener) {
            if (groupedListener.eventInfo.options.debug || groupedListener.listener.options.debug) {
                this.options.log("Listener fired", {
                    time: Date.now() - time,
                    info: groupedListener
                });
            }
        }
        debugTime(groupedListener) {
            return groupedListener.listener.options.debug || groupedListener.eventInfo.options.debug ? Date.now() : 0;
        }
    }
    const State = DeepState;

    exports.State = State;
    exports.default = DeepState;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
