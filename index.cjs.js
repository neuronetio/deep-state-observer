'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// forked from https://github.com/joonhocho/superwild
class Matcher {
    constructor(pattern, wchar = '*') {
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
    match(match) {
        if (this.pattern === '*') {
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
    }
}

class WildcardObject {
    constructor(obj, delimeter, wildcard) {
        this.obj = obj;
        this.delimeter = delimeter;
        this.wildcard = wildcard;
    }
    simpleMatch(first, second) {
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
    }
    match(first, second) {
        return (first === second ||
            first === this.wildcard ||
            second === this.wildcard ||
            this.simpleMatch(first, second) ||
            new Matcher(first).match(second));
    }
    handleArray(wildcard, currentArr, partIndex, path, result = {}) {
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
    }
    handleObject(wildcard, currentObj, partIndex, path, result = {}) {
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
    }
    goFurther(wildcard, currentObj, partIndex, currentPath, result = {}) {
        if (Array.isArray(currentObj)) {
            return this.handleArray(wildcard, currentObj, partIndex, currentPath, result);
        }
        return this.handleObject(wildcard, currentObj, partIndex, currentPath, result);
    }
    get(wildcard) {
        return this.goFurther(wildcard, this.obj, 0, '');
    }
}

class ObjectPath {
    static get(path, obj, copiedPath = null) {
        if (copiedPath === null) {
            copiedPath = path.slice();
        }
        if (copiedPath.length === 0 || typeof obj === 'undefined') {
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
        if (!obj.hasOwnProperty(currentPath)) {
            obj[currentPath] = {};
        }
        ObjectPath.set(path, newValue, obj[currentPath], copiedPath);
    }
}

function log(message, info) {
    console.debug(message, info);
}
const defaultOptions = { delimeter: `.`, notRecursive: `;`, param: `:`, wildcard: `*`, log };
const defaultListenerOptions = { bulk: false, debug: false, source: '', data: undefined };
const defaultUpdateOptions = { only: [], source: '', debug: false, data: undefined };
class DeepState {
    constructor(data = {}, options = defaultOptions) {
        this.listeners = {};
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
        this.listeners = {};
    }
    match(first, second) {
        if (first === second)
            return true;
        if (first === this.options.wildcard || second === this.options.wildcard)
            return true;
        return this.scan.match(first, second);
    }
    cutPath(longer, shorter) {
        return this.split(this.cleanNotRecursivePath(longer))
            .slice(0, this.split(this.cleanNotRecursivePath(shorter)).length)
            .join(this.options.delimeter);
    }
    trimPath(path) {
        return this.cleanNotRecursivePath(path).replace(new RegExp(`^\\${this.options.delimeter}{1}`), ``);
    }
    split(path) {
        return path === '' ? [] : path.split(this.options.delimeter);
    }
    isWildcard(path) {
        return path.includes(this.options.wildcard);
    }
    isNotRecursive(path) {
        return path.endsWith(this.options.notRecursive);
    }
    cleanNotRecursivePath(path) {
        return this.isNotRecursive(path) ? path.slice(0, -this.options.notRecursive.length) : path;
    }
    hasParams(path) {
        return path.includes(this.options.param);
    }
    getParamsInfo(path) {
        let paramsInfo = { replaced: '', original: path, params: {} };
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
    subscribeAll(userPaths, fn, options = defaultListenerOptions) {
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
    getCleanListenersCollection(values = {}) {
        return Object.assign({
            listeners: {},
            isRecursive: false,
            isWildcard: false,
            hasParams: false,
            match: undefined,
            paramsInfo: undefined,
            path: undefined
        }, values);
    }
    getCleanListener(fn, options = defaultListenerOptions) {
        return {
            fn,
            options: Object.assign({}, defaultListenerOptions, options)
        };
    }
    getListenerCollectionMatch(listenerPath, isRecursive, isWildcard) {
        return (path) => {
            if (isRecursive)
                path = this.cutPath(path, listenerPath);
            if (isWildcard && this.match(listenerPath, path))
                return true;
            return listenerPath === path;
        };
    }
    getListenersCollection(listenerPath, listener) {
        if (typeof this.listeners[listenerPath] !== 'undefined') {
            let listenersCollection = this.listeners[listenerPath];
            this.id++;
            listenersCollection.listeners[this.id] = listener;
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
            collCfg.path = this.cleanNotRecursivePath(collCfg.path);
            collCfg.isRecursive = false;
        }
        let listenersCollection = (this.listeners[collCfg.path] = this.getCleanListenersCollection(Object.assign({}, collCfg, { match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard) })));
        this.id++;
        listenersCollection.listeners[this.id] = listener;
        return listenersCollection;
    }
    subscribe(listenerPath, fn, options = defaultListenerOptions, type = 'subscribe') {
        let listener = this.getCleanListener(fn, options);
        const listenersCollection = this.getListenersCollection(listenerPath, listener);
        listenerPath = listenersCollection.path;
        if (!listenersCollection.isWildcard) {
            fn(this.pathGet(this.split(listenerPath), this.data), {
                type,
                path: {
                    listener: listenerPath,
                    update: undefined,
                    resolved: listenerPath
                },
                params: this.getParams(listenersCollection.paramsInfo, listenerPath),
                options
            });
        }
        else {
            const paths = this.scan.get(listenerPath);
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
                        path: {
                            listener: listenerPath,
                            update: undefined,
                            resolved: path
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
    empty(obj) {
        for (const key in obj) {
            return false;
        }
        return true;
    }
    unsubscribe(path, id) {
        return () => {
            delete this.listeners[path].listeners[id];
            if (this.empty(this.listeners[path].listeners)) {
                delete this.listeners[path];
            }
        };
    }
    same(newValue, oldValue) {
        return ((['number', 'string', 'undefined', 'boolean'].includes(typeof newValue) || newValue === null) &&
            oldValue === newValue);
    }
    notifyListeners(listeners, exclude = [], returnNotified = true) {
        const alreadyNotified = [];
        for (const path in listeners) {
            let { single, bulk } = listeners[path];
            for (const singleListener of single) {
                if (exclude.includes(singleListener))
                    continue;
                const time = this.debugTime(singleListener);
                singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
                if (returnNotified)
                    alreadyNotified.push(singleListener);
                this.debugListener(time, singleListener);
            }
            for (const bulkListener of bulk) {
                if (exclude.includes(bulkListener))
                    continue;
                const time = this.debugTime(bulkListener);
                const bulkValue = bulkListener.value.map((bulk) => (Object.assign({}, bulk, { value: bulk.value() })));
                bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
                if (returnNotified)
                    alreadyNotified.push(bulkListener);
                this.debugListener(time, bulkListener);
            }
        }
        return alreadyNotified;
    }
    getSubscribedListeners(updatePath, newValue, options, type = 'update', originalPath = null) {
        options = Object.assign({}, defaultUpdateOptions, options);
        const listeners = {};
        for (let listenerPath in this.listeners) {
            const listenersCollection = this.listeners[listenerPath];
            listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
            if (listenersCollection.match(updatePath)) {
                const params = listenersCollection.paramsInfo
                    ? this.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                const value = listenersCollection.isRecursive || listenersCollection.isWildcard
                    ? () => this.get(this.cutPath(updatePath, listenerPath))
                    : () => newValue;
                const bulkValue = [{ value, path: updatePath, params }];
                for (const listenerId in listenersCollection.listeners) {
                    const listener = listenersCollection.listeners[listenerId];
                    if (listener.options.bulk) {
                        listeners[listenerPath].bulk.push({
                            listener,
                            listenersCollection,
                            eventInfo: {
                                type,
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
                                path: {
                                    listener: listenerPath,
                                    update: originalPath ? originalPath : updatePath,
                                    resolved: updatePath
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
    notifySubscribedListeners(updatePath, newValue, options, type = 'update', originalPath = null) {
        return this.notifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
    }
    getNestedListeners(updatePath, newValue, options, type = 'update', originalPath = null) {
        const listeners = {};
        for (let listenerPath in this.listeners) {
            listeners[listenerPath] = { single: [], bulk: [] };
            const listenersCollection = this.listeners[listenerPath];
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
                    for (const listenerId in listenersCollection.listeners) {
                        const listener = listenersCollection.listeners[listenerId];
                        const eventInfo = {
                            type,
                            path: {
                                listener: listenerPath,
                                update: originalPath ? originalPath : updatePath,
                                resolved: fullPath
                            },
                            params,
                            options
                        };
                        if (listener.options.bulk) {
                            bulk.push({ value, path: fullPath, params });
                            bulkListeners[listenerId] = listener;
                        }
                        else {
                            listeners[listenerPath].single.push({ listener, listenersCollection, eventInfo, value });
                        }
                    }
                }
                for (const listenerId in bulkListeners) {
                    const listener = bulkListeners[listenerId];
                    const eventInfo = {
                        type,
                        path: {
                            listener: listenerPath,
                            update: updatePath,
                            resolved: undefined
                        },
                        options,
                        params
                    };
                    listeners[listenerPath].bulk.push({ listener, listenersCollection, eventInfo, value: bulk });
                }
            }
        }
        return listeners;
    }
    notifyNestedListeners(updatePath, newValue, options, type = 'update', alreadyNotified, originalPath = null) {
        return this.notifyListeners(this.getNestedListeners(updatePath, newValue, options, type, originalPath), alreadyNotified, false);
    }
    getNotifyOnlyListeners(updatePath, newValue, options, type = 'update', originalPath = null) {
        const listeners = {};
        if (typeof options.only !== 'object' ||
            !Array.isArray(options.only) ||
            typeof options.only[0] === 'undefined' ||
            !this.canBeNested(newValue)) {
            return listeners;
        }
        for (const notifyPath of options.only) {
            const wildcardScan = new WildcardObject(newValue, this.options.delimeter, this.options.wildcard).get(notifyPath);
            listeners[notifyPath] = { bulk: [], single: [] };
            for (const wildcardPath in wildcardScan) {
                const fullPath = updatePath + this.options.delimeter + wildcardPath;
                for (const listenerPath in this.listeners) {
                    const listenersCollection = this.listeners[listenerPath];
                    const params = listenersCollection.paramsInfo
                        ? this.getParams(listenersCollection.paramsInfo, fullPath)
                        : undefined;
                    if (this.match(listenerPath, fullPath)) {
                        const value = () => wildcardScan[wildcardPath];
                        const bulkValue = [{ value, path: fullPath, params }];
                        for (const listenerId in listenersCollection.listeners) {
                            const listener = listenersCollection.listeners[listenerId];
                            const eventInfo = {
                                type,
                                path: {
                                    listener: listenerPath,
                                    update: originalPath ? originalPath : updatePath,
                                    resolved: fullPath
                                },
                                params,
                                options
                            };
                            if (listener.options.bulk) {
                                if (!listeners[notifyPath].bulk.some((bulkListener) => bulkListener.listener === listener)) {
                                    listeners[notifyPath].bulk.push({ listener, listenersCollection, eventInfo, value: bulkValue });
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
    notifyOnly(updatePath, newValue, options, type = 'update', originalPath = null) {
        return (typeof this.notifyListeners(this.getNotifyOnlyListeners(updatePath, newValue, options, type, originalPath))[0] !==
            'undefined');
    }
    canBeNested(newValue) {
        return typeof newValue === 'object' && newValue !== null;
    }
    getUpdateValues(oldValue, split, fn) {
        if (typeof oldValue === 'object' && oldValue !== null) {
            Array.isArray(oldValue) ? (oldValue = oldValue.slice()) : (oldValue = Object.assign({}, oldValue));
        }
        let newValue = fn;
        if (typeof fn === 'function') {
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
        for (const path in bulk) {
            const newValue = bulk[path];
            if (options.only.length) {
                groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, options, 'update', updatePath));
            }
            else {
                groupedListenersPack.push(this.getSubscribedListeners(path, newValue, options, 'update', updatePath));
                this.canBeNested(newValue) &&
                    groupedListenersPack.push(this.getNestedListeners(path, newValue, options, 'update', updatePath));
            }
            options.debug && this.options.log('Wildcard update', { path, newValue });
            this.pathSet(this.split(path), newValue, this.data);
        }
        let alreadyNotified = [];
        for (const groupedListeners of groupedListenersPack) {
            alreadyNotified = [...alreadyNotified, ...this.notifyListeners(groupedListeners, alreadyNotified)];
        }
    }
    update(updatePath, fn, options = defaultUpdateOptions) {
        if (this.isWildcard(updatePath)) {
            return this.wildcardUpdate(updatePath, fn, options);
        }
        const split = this.split(updatePath);
        const { oldValue, newValue } = this.getUpdateValues(this.pathGet(split, this.data), split, fn);
        if (options.debug) {
            this.options.log(`Updating ${updatePath} ${options.source ? `from ${options.source}` : ''}`, oldValue, newValue);
        }
        if (this.same(newValue, oldValue)) {
            return newValue;
        }
        this.pathSet(split, newValue, this.data);
        options = Object.assign({}, defaultUpdateOptions, options);
        if (this.notifyOnly(updatePath, newValue, options)) {
            return newValue;
        }
        const alreadyNotified = this.notifySubscribedListeners(updatePath, newValue, options);
        if (this.canBeNested(newValue)) {
            this.notifyNestedListeners(updatePath, newValue, options, 'update', alreadyNotified);
        }
        return newValue;
    }
    get(userPath = undefined) {
        if (typeof userPath === 'undefined' || userPath === '') {
            return this.data;
        }
        return this.pathGet(this.split(userPath), this.data);
    }
    debugSubscribe(listener, listenersCollection, listenerPath) {
        if (listener.options.debug) {
            this.options.log('listener subscribed', listenerPath, listener, listenersCollection);
        }
    }
    debugListener(time, groupedListener) {
        if (groupedListener.eventInfo.options.debug || groupedListener.listener.options.debug) {
            this.options.log('Listener fired', {
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
