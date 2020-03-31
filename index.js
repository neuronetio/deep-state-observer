"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var wildcard_object_scan_1 = require("./wildcard-object-scan");
var ObjectPath_1 = require("./ObjectPath");
function log(message, info) {
    console.debug(message, info);
}
var defaultOptions = {
    delimeter: ".",
    notRecursive: ";",
    param: ":",
    wildcard: "*",
    queue: false,
    maxSimultaneousJobs: 1000,
    log: log
};
var defaultListenerOptions = {
    bulk: false,
    debug: false,
    source: "",
    data: undefined,
    queue: false
};
var defaultUpdateOptions = {
    only: [],
    source: "",
    debug: false,
    data: undefined,
    queue: false
};
var DeepState = /** @class */ (function () {
    function DeepState(data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = defaultOptions; }
        this.jobsRunning = 0;
        this.updateQueue = [];
        this.subscribeQueue = [];
        this.listeners = new Map();
        this.waitingListeners = new Map();
        this.data = data;
        this.options = __assign({}, defaultOptions, options);
        this.id = 0;
        this.pathGet = ObjectPath_1["default"].get;
        this.pathSet = ObjectPath_1["default"].set;
        this.scan = new wildcard_object_scan_1["default"](this.data, this.options.delimeter, this.options.wildcard);
    }
    DeepState.prototype.getListeners = function () {
        return this.listeners;
    };
    DeepState.prototype.destroy = function () {
        this.data = undefined;
        this.listeners = new Map();
    };
    DeepState.prototype.match = function (first, second) {
        if (first === second)
            return true;
        if (first === this.options.wildcard || second === this.options.wildcard)
            return true;
        return this.scan.match(first, second);
    };
    DeepState.prototype.getIndicesOf = function (searchStr, str) {
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    };
    DeepState.prototype.getIndicesCount = function (searchStr, str) {
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return 0;
        }
        var startIndex = 0, index, indices = 0;
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices++;
            startIndex = index + searchStrLen;
        }
        return indices;
    };
    DeepState.prototype.cutPath = function (longer, shorter) {
        longer = this.cleanNotRecursivePath(longer);
        shorter = this.cleanNotRecursivePath(shorter);
        var shorterPartsLen = this.getIndicesCount(this.options.delimeter, shorter);
        var longerParts = this.getIndicesOf(this.options.delimeter, longer);
        return longer.substr(0, longerParts[shorterPartsLen]);
    };
    DeepState.prototype.trimPath = function (path) {
        path = this.cleanNotRecursivePath(path);
        if (path.charAt(0) === this.options.delimeter) {
            return path.substr(1);
        }
        return path;
    };
    DeepState.prototype.split = function (path) {
        return path === "" ? [] : path.split(this.options.delimeter);
    };
    DeepState.prototype.isWildcard = function (path) {
        return path.includes(this.options.wildcard);
    };
    DeepState.prototype.isNotRecursive = function (path) {
        return path.endsWith(this.options.notRecursive);
    };
    DeepState.prototype.cleanNotRecursivePath = function (path) {
        return this.isNotRecursive(path) ? path.substring(0, path.length - 1) : path;
    };
    DeepState.prototype.hasParams = function (path) {
        return path.includes(this.options.param);
    };
    DeepState.prototype.getParamsInfo = function (path) {
        var e_1, _a;
        var paramsInfo = { replaced: "", original: path, params: {} };
        var partIndex = 0;
        var fullReplaced = [];
        try {
            for (var _b = __values(this.split(path)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var part = _c.value;
                paramsInfo.params[partIndex] = {
                    original: part,
                    replaced: "",
                    name: ""
                };
                var reg = new RegExp("\\" + this.options.param + "([^\\" + this.options.delimeter + "\\" + this.options.param + "]+)", "g");
                var param = reg.exec(part);
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        paramsInfo.replaced = fullReplaced.join(this.options.delimeter);
        return paramsInfo;
    };
    DeepState.prototype.getParams = function (paramsInfo, path) {
        if (!paramsInfo) {
            return undefined;
        }
        var split = this.split(path);
        var result = {};
        for (var partIndex in paramsInfo.params) {
            var param = paramsInfo.params[partIndex];
            result[param.name] = split[partIndex];
        }
        return result;
    };
    DeepState.prototype.waitForAll = function (userPaths, fn) {
        var e_2, _a;
        var paths = {};
        try {
            for (var userPaths_1 = __values(userPaths), userPaths_1_1 = userPaths_1.next(); !userPaths_1_1.done; userPaths_1_1 = userPaths_1.next()) {
                var path = userPaths_1_1.value;
                paths[path] = { dirty: false };
                if (this.hasParams(path)) {
                    paths[path].paramsInfo = this.getParamsInfo(path);
                }
                paths[path].isWildcard = this.isWildcard(path);
                paths[path].isRecursive = !this.isNotRecursive(path);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (userPaths_1_1 && !userPaths_1_1.done && (_a = userPaths_1["return"])) _a.call(userPaths_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.waitingListeners.set(userPaths, { fn: fn, paths: paths });
        fn(paths);
        return function unsubscribe() {
            this.waitingListeners["delete"](userPaths);
        };
    };
    DeepState.prototype.executeWaitingListeners = function (updatePath) {
        var e_3, _a;
        try {
            for (var _b = __values(this.waitingListeners.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var waitingListener = _c.value;
                var fn = waitingListener.fn, paths = waitingListener.paths;
                var dirty = 0;
                var all = 0;
                for (var path in paths) {
                    var pathInfo = paths[path];
                    var match = false;
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
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    DeepState.prototype.subscribeAll = function (userPaths, fn, options) {
        var e_4, _a;
        if (options === void 0) { options = defaultListenerOptions; }
        var unsubscribers = [];
        try {
            for (var userPaths_2 = __values(userPaths), userPaths_2_1 = userPaths_2.next(); !userPaths_2_1.done; userPaths_2_1 = userPaths_2.next()) {
                var userPath = userPaths_2_1.value;
                unsubscribers.push(this.subscribe(userPath, fn, options));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (userPaths_2_1 && !userPaths_2_1.done && (_a = userPaths_2["return"])) _a.call(userPaths_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return function unsubscribe() {
            var e_5, _a;
            try {
                for (var unsubscribers_1 = __values(unsubscribers), unsubscribers_1_1 = unsubscribers_1.next(); !unsubscribers_1_1.done; unsubscribers_1_1 = unsubscribers_1.next()) {
                    var unsubscribe_1 = unsubscribers_1_1.value;
                    unsubscribe_1();
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (unsubscribers_1_1 && !unsubscribers_1_1.done && (_a = unsubscribers_1["return"])) _a.call(unsubscribers_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
        };
    };
    DeepState.prototype.getCleanListenersCollection = function (values) {
        if (values === void 0) { values = {}; }
        return __assign({ listeners: new Map(), isRecursive: false, isWildcard: false, hasParams: false, match: undefined, paramsInfo: undefined, path: undefined, count: 0 }, values);
    };
    DeepState.prototype.getCleanListener = function (fn, options) {
        if (options === void 0) { options = defaultListenerOptions; }
        return {
            fn: fn,
            options: __assign({}, defaultListenerOptions, options)
        };
    };
    DeepState.prototype.getListenerCollectionMatch = function (listenerPath, isRecursive, isWildcard) {
        listenerPath = this.cleanNotRecursivePath(listenerPath);
        var self = this;
        return function listenerCollectionMatch(path) {
            if (isRecursive)
                path = self.cutPath(path, listenerPath);
            if (isWildcard && self.match(listenerPath, path))
                return true;
            return listenerPath === path;
        };
    };
    DeepState.prototype.getListenersCollection = function (listenerPath, listener) {
        if (this.listeners.has(listenerPath)) {
            var listenersCollection_1 = this.listeners.get(listenerPath);
            listenersCollection_1.listeners.set(++this.id, listener);
            return listenersCollection_1;
        }
        var collCfg = {
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
        var listenersCollection = this.getCleanListenersCollection(__assign({}, collCfg, { match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard) }));
        this.id++;
        listenersCollection.listeners.set(this.id, listener);
        this.listeners.set(collCfg.path, listenersCollection);
        return listenersCollection;
    };
    DeepState.prototype.subscribe = function (listenerPath, fn, options, type) {
        if (options === void 0) { options = defaultListenerOptions; }
        if (type === void 0) { type = "subscribe"; }
        this.jobsRunning++;
        var listener = this.getCleanListener(fn, options);
        var listenersCollection = this.getListenersCollection(listenerPath, listener);
        listenersCollection.count++;
        listenerPath = listenersCollection.path;
        if (!listenersCollection.isWildcard) {
            fn(this.pathGet(this.split(this.cleanNotRecursivePath(listenerPath)), this.data), {
                type: type,
                listener: listener,
                listenersCollection: listenersCollection,
                path: {
                    listener: listenerPath,
                    update: undefined,
                    resolved: this.cleanNotRecursivePath(listenerPath)
                },
                params: this.getParams(listenersCollection.paramsInfo, listenerPath),
                options: options
            });
        }
        else {
            var paths = this.scan.get(this.cleanNotRecursivePath(listenerPath));
            if (options.bulk) {
                var bulkValue = [];
                for (var path in paths) {
                    bulkValue.push({
                        path: path,
                        params: this.getParams(listenersCollection.paramsInfo, path),
                        value: paths[path]
                    });
                }
                fn(bulkValue, {
                    type: type,
                    listener: listener,
                    listenersCollection: listenersCollection,
                    path: {
                        listener: listenerPath,
                        update: undefined,
                        resolved: undefined
                    },
                    options: options,
                    params: undefined
                });
            }
            else {
                for (var path in paths) {
                    fn(paths[path], {
                        type: type,
                        listener: listener,
                        listenersCollection: listenersCollection,
                        path: {
                            listener: listenerPath,
                            update: undefined,
                            resolved: this.cleanNotRecursivePath(path)
                        },
                        params: this.getParams(listenersCollection.paramsInfo, path),
                        options: options
                    });
                }
            }
        }
        this.debugSubscribe(listener, listenersCollection, listenerPath);
        this.jobsRunning--;
        return this.unsubscribe(listenerPath, this.id);
    };
    DeepState.prototype.unsubscribe = function (path, id) {
        var listeners = this.listeners;
        var listenersCollection = listeners.get(path);
        return function unsub() {
            listenersCollection.listeners["delete"](id);
            listenersCollection.count--;
            if (listenersCollection.count === 0) {
                listeners["delete"](path);
            }
        };
    };
    DeepState.prototype.same = function (newValue, oldValue) {
        return ((["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
            oldValue === newValue);
    };
    DeepState.prototype.runQueuedListeners = function () {
        var _this = this;
        if (this.subscribeQueue.length === 0)
            return;
        var queue = __spread(this.subscribeQueue);
        for (var i = 0, len = queue.length; i < len; i++) {
            var remove = queue[i]();
            if (remove) {
                var index = this.subscribeQueue.indexOf(queue[i]);
                if (index > -1) {
                    this.subscribeQueue.splice(index, 1);
                }
            }
        }
        Promise.resolve().then(function () { return _this.runQueuedListeners(); });
    };
    DeepState.prototype.notifyListeners = function (listeners, exclude, returnNotified) {
        var e_6, _a, e_7, _b;
        var _this = this;
        if (exclude === void 0) { exclude = []; }
        if (returnNotified === void 0) { returnNotified = true; }
        var alreadyNotified = [];
        for (var path in listeners) {
            var _c = listeners[path], single = _c.single, bulk = _c.bulk;
            var _loop_1 = function (singleListener) {
                if (exclude.includes(singleListener))
                    return "continue";
                var time = this_1.debugTime(singleListener);
                if (singleListener.listener.options.queue && this_1.jobsRunning) {
                    this_1.subscribeQueue.push(function () {
                        if (!_this.jobsRunning) {
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
                this_1.debugListener(time, singleListener);
            };
            var this_1 = this;
            try {
                for (var single_1 = (e_6 = void 0, __values(single)), single_1_1 = single_1.next(); !single_1_1.done; single_1_1 = single_1.next()) {
                    var singleListener = single_1_1.value;
                    _loop_1(singleListener);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (single_1_1 && !single_1_1.done && (_a = single_1["return"])) _a.call(single_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var _loop_2 = function (bulkListener) {
                var e_8, _a;
                if (exclude.includes(bulkListener))
                    return "continue";
                var time = this_2.debugTime(bulkListener);
                var bulkValue = [];
                try {
                    for (var _b = (e_8 = void 0, __values(bulkListener.value)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var bulk_2 = _c.value;
                        bulkValue.push(__assign({}, bulk_2, { value: bulk_2.value() }));
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                if (bulkListener.listener.options.queue && this_2.jobsRunning) {
                    this_2.subscribeQueue.push(function () {
                        if (!_this.jobsRunning) {
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
                this_2.debugListener(time, bulkListener);
            };
            var this_2 = this;
            try {
                for (var bulk_1 = (e_7 = void 0, __values(bulk)), bulk_1_1 = bulk_1.next(); !bulk_1_1.done; bulk_1_1 = bulk_1.next()) {
                    var bulkListener = bulk_1_1.value;
                    _loop_2(bulkListener);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (bulk_1_1 && !bulk_1_1.done && (_b = bulk_1["return"])) _b.call(bulk_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
        Promise.resolve().then(function () { return _this.runQueuedListeners(); });
        return alreadyNotified;
    };
    DeepState.prototype.getSubscribedListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_9, _a;
        var _this = this;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        options = __assign({}, defaultUpdateOptions, options);
        var listeners = {};
        var _loop_3 = function (listenerPath, listenersCollection) {
            var e_10, _a;
            listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
            if (listenersCollection.match(updatePath)) {
                var params = listenersCollection.paramsInfo
                    ? this_3.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                var value = listenersCollection.isRecursive || listenersCollection.isWildcard
                    ? function () { return _this.get(_this.cutPath(updatePath, listenerPath)); }
                    : function () { return newValue; };
                var bulkValue = [{ value: value, path: updatePath, params: params }];
                try {
                    for (var _b = (e_10 = void 0, __values(listenersCollection.listeners.values())), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var listener = _c.value;
                        if (listener.options.bulk) {
                            listeners[listenerPath].bulk.push({
                                listener: listener,
                                listenersCollection: listenersCollection,
                                eventInfo: {
                                    type: type,
                                    listener: listener,
                                    path: {
                                        listener: listenerPath,
                                        update: originalPath ? originalPath : updatePath,
                                        resolved: undefined
                                    },
                                    params: params,
                                    options: options
                                },
                                value: bulkValue
                            });
                        }
                        else {
                            listeners[listenerPath].single.push({
                                listener: listener,
                                listenersCollection: listenersCollection,
                                eventInfo: {
                                    type: type,
                                    listener: listener,
                                    path: {
                                        listener: listenerPath,
                                        update: originalPath ? originalPath : updatePath,
                                        resolved: this_3.cleanNotRecursivePath(updatePath)
                                    },
                                    params: params,
                                    options: options
                                },
                                value: value
                            });
                        }
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
            }
        };
        var this_3 = this;
        try {
            for (var _b = __values(this.listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), listenerPath = _d[0], listenersCollection = _d[1];
                _loop_3(listenerPath, listenersCollection);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifySubscribedListeners = function (updatePath, newValue, options, type, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        return this.notifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
    };
    DeepState.prototype.getNestedListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_11, _a;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        var listeners = {};
        var _loop_4 = function (listenerPath, listenersCollection) {
            listeners[listenerPath] = { single: [], bulk: [] };
            var currentCuttedPath = this_4.cutPath(listenerPath, updatePath);
            if (this_4.match(currentCuttedPath, updatePath)) {
                var restPath = this_4.trimPath(listenerPath.substr(currentCuttedPath.length));
                var values_1 = new wildcard_object_scan_1["default"](newValue, this_4.options.delimeter, this_4.options.wildcard).get(restPath);
                var params = listenersCollection.paramsInfo
                    ? this_4.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                var bulk = [];
                var bulkListeners = {};
                var _loop_5 = function (currentRestPath) {
                    var e_12, _a;
                    var value = function () { return values_1[currentRestPath]; };
                    var fullPath = [updatePath, currentRestPath].join(this_4.options.delimeter);
                    try {
                        for (var _b = (e_12 = void 0, __values(listenersCollection.listeners)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var _d = __read(_c.value, 2), listenerId = _d[0], listener = _d[1];
                            var eventInfo = {
                                type: type,
                                listener: listener,
                                listenersCollection: listenersCollection,
                                path: {
                                    listener: listenerPath,
                                    update: originalPath ? originalPath : updatePath,
                                    resolved: this_4.cleanNotRecursivePath(fullPath)
                                },
                                params: params,
                                options: options
                            };
                            if (listener.options.bulk) {
                                bulk.push({ value: value, path: fullPath, params: params });
                                bulkListeners[listenerId] = listener;
                            }
                            else {
                                listeners[listenerPath].single.push({
                                    listener: listener,
                                    listenersCollection: listenersCollection,
                                    eventInfo: eventInfo,
                                    value: value
                                });
                            }
                        }
                    }
                    catch (e_12_1) { e_12 = { error: e_12_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                        }
                        finally { if (e_12) throw e_12.error; }
                    }
                };
                for (var currentRestPath in values_1) {
                    _loop_5(currentRestPath);
                }
                for (var listenerId in bulkListeners) {
                    var listener = bulkListeners[listenerId];
                    var eventInfo = {
                        type: type,
                        listener: listener,
                        listenersCollection: listenersCollection,
                        path: {
                            listener: listenerPath,
                            update: updatePath,
                            resolved: undefined
                        },
                        options: options,
                        params: params
                    };
                    listeners[listenerPath].bulk.push({
                        listener: listener,
                        listenersCollection: listenersCollection,
                        eventInfo: eventInfo,
                        value: bulk
                    });
                }
            }
        };
        var this_4 = this;
        try {
            for (var _b = __values(this.listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), listenerPath = _d[0], listenersCollection = _d[1];
                _loop_4(listenerPath, listenersCollection);
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifyNestedListeners = function (updatePath, newValue, options, type, alreadyNotified, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        return this.notifyListeners(this.getNestedListeners(updatePath, newValue, options, type, originalPath), alreadyNotified, false);
    };
    DeepState.prototype.getNotifyOnlyListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_13, _a;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        var listeners = {};
        if (typeof options.only !== "object" ||
            !Array.isArray(options.only) ||
            typeof options.only[0] === "undefined" ||
            !this.canBeNested(newValue)) {
            return listeners;
        }
        var _loop_6 = function (notifyPath) {
            var wildcardScan = new wildcard_object_scan_1["default"](newValue, this_5.options.delimeter, this_5.options.wildcard).get(notifyPath);
            listeners[notifyPath] = { bulk: [], single: [] };
            var _loop_7 = function (wildcardPath) {
                var e_14, _a, e_15, _b;
                var fullPath = updatePath + this_5.options.delimeter + wildcardPath;
                try {
                    for (var _c = (e_14 = void 0, __values(this_5.listeners)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), listenerPath = _e[0], listenersCollection = _e[1];
                        var params = listenersCollection.paramsInfo
                            ? this_5.getParams(listenersCollection.paramsInfo, fullPath)
                            : undefined;
                        if (this_5.match(listenerPath, fullPath)) {
                            var value = function () { return wildcardScan[wildcardPath]; };
                            var bulkValue = [{ value: value, path: fullPath, params: params }];
                            var _loop_8 = function (listener) {
                                var eventInfo = {
                                    type: type,
                                    listener: listener,
                                    listenersCollection: listenersCollection,
                                    path: {
                                        listener: listenerPath,
                                        update: originalPath ? originalPath : updatePath,
                                        resolved: this_5.cleanNotRecursivePath(fullPath)
                                    },
                                    params: params,
                                    options: options
                                };
                                if (listener.options.bulk) {
                                    if (!listeners[notifyPath].bulk.some(function (bulkListener) { return bulkListener.listener === listener; })) {
                                        listeners[notifyPath].bulk.push({
                                            listener: listener,
                                            listenersCollection: listenersCollection,
                                            eventInfo: eventInfo,
                                            value: bulkValue
                                        });
                                    }
                                }
                                else {
                                    listeners[notifyPath].single.push({
                                        listener: listener,
                                        listenersCollection: listenersCollection,
                                        eventInfo: eventInfo,
                                        value: value
                                    });
                                }
                            };
                            try {
                                for (var _f = (e_15 = void 0, __values(listenersCollection.listeners.values())), _g = _f.next(); !_g.done; _g = _f.next()) {
                                    var listener = _g.value;
                                    _loop_8(listener);
                                }
                            }
                            catch (e_15_1) { e_15 = { error: e_15_1 }; }
                            finally {
                                try {
                                    if (_g && !_g.done && (_b = _f["return"])) _b.call(_f);
                                }
                                finally { if (e_15) throw e_15.error; }
                            }
                        }
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            };
            for (var wildcardPath in wildcardScan) {
                _loop_7(wildcardPath);
            }
        };
        var this_5 = this;
        try {
            for (var _b = __values(options.only), _c = _b.next(); !_c.done; _c = _b.next()) {
                var notifyPath = _c.value;
                _loop_6(notifyPath);
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_13) throw e_13.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifyOnly = function (updatePath, newValue, options, type, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = ""; }
        return (typeof this.notifyListeners(this.getNotifyOnlyListeners(updatePath, newValue, options, type, originalPath))[0] !==
            "undefined");
    };
    DeepState.prototype.canBeNested = function (newValue) {
        return typeof newValue === "object" && newValue !== null;
    };
    DeepState.prototype.getUpdateValues = function (oldValue, split, fn) {
        if (typeof oldValue === "object" && oldValue !== null) {
            Array.isArray(oldValue) ? (oldValue = oldValue.slice()) : (oldValue = __assign({}, oldValue));
        }
        var newValue = fn;
        if (typeof fn === "function") {
            newValue = fn(this.pathGet(split, this.data));
        }
        return { newValue: newValue, oldValue: oldValue };
    };
    DeepState.prototype.wildcardUpdate = function (updatePath, fn, options) {
        var e_16, _a, e_17, _b;
        if (options === void 0) { options = defaultUpdateOptions; }
        options = __assign({}, defaultUpdateOptions, options);
        var scanned = this.scan.get(updatePath);
        var bulk = {};
        for (var path in scanned) {
            var split = this.split(path);
            var _c = this.getUpdateValues(scanned[path], split, fn), oldValue = _c.oldValue, newValue = _c.newValue;
            if (!this.same(newValue, oldValue))
                bulk[path] = newValue;
        }
        var groupedListenersPack = [];
        var waitingPaths = [];
        for (var path in bulk) {
            var newValue = bulk[path];
            if (options.only.length) {
                groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, options, "update", updatePath));
            }
            else {
                groupedListenersPack.push(this.getSubscribedListeners(path, newValue, options, "update", updatePath));
                this.canBeNested(newValue) &&
                    groupedListenersPack.push(this.getNestedListeners(path, newValue, options, "update", updatePath));
            }
            options.debug && this.options.log("Wildcard update", { path: path, newValue: newValue });
            this.pathSet(this.split(path), newValue, this.data);
            waitingPaths.push(path);
        }
        var alreadyNotified = [];
        try {
            for (var groupedListenersPack_1 = __values(groupedListenersPack), groupedListenersPack_1_1 = groupedListenersPack_1.next(); !groupedListenersPack_1_1.done; groupedListenersPack_1_1 = groupedListenersPack_1.next()) {
                var groupedListeners = groupedListenersPack_1_1.value;
                alreadyNotified = __spread(alreadyNotified, this.notifyListeners(groupedListeners, alreadyNotified));
            }
        }
        catch (e_16_1) { e_16 = { error: e_16_1 }; }
        finally {
            try {
                if (groupedListenersPack_1_1 && !groupedListenersPack_1_1.done && (_a = groupedListenersPack_1["return"])) _a.call(groupedListenersPack_1);
            }
            finally { if (e_16) throw e_16.error; }
        }
        try {
            for (var waitingPaths_1 = __values(waitingPaths), waitingPaths_1_1 = waitingPaths_1.next(); !waitingPaths_1_1.done; waitingPaths_1_1 = waitingPaths_1.next()) {
                var path = waitingPaths_1_1.value;
                this.executeWaitingListeners(path);
            }
        }
        catch (e_17_1) { e_17 = { error: e_17_1 }; }
        finally {
            try {
                if (waitingPaths_1_1 && !waitingPaths_1_1.done && (_b = waitingPaths_1["return"])) _b.call(waitingPaths_1);
            }
            finally { if (e_17) throw e_17.error; }
        }
        this.jobsRunning--;
    };
    DeepState.prototype.runUpdateQueue = function () {
        while (this.updateQueue.length) {
            var params = this.updateQueue.shift();
            this.update(params.updatePath, params.fn, params.options);
        }
    };
    DeepState.prototype.update = function (updatePath, fn, options) {
        var _this = this;
        if (options === void 0) { options = defaultUpdateOptions; }
        var jobsRunning = this.jobsRunning;
        if ((this.options.queue || options.queue) && jobsRunning) {
            if (jobsRunning > this.options.maxSimultaneousJobs) {
                throw new Error("Maximal simultaneous jobs limit reached.");
            }
            this.updateQueue.push({ updatePath: updatePath, fn: fn, options: options });
            return Promise.resolve().then(function () {
                _this.runUpdateQueue();
            });
        }
        this.jobsRunning++;
        if (this.isWildcard(updatePath)) {
            return this.wildcardUpdate(updatePath, fn, options);
        }
        var split = this.split(updatePath);
        var _a = this.getUpdateValues(this.pathGet(split, this.data), split, fn), oldValue = _a.oldValue, newValue = _a.newValue;
        if (options.debug) {
            this.options.log("Updating " + updatePath + " " + (options.source ? "from " + options.source : ""), {
                oldValue: oldValue,
                newValue: newValue
            });
        }
        if (this.same(newValue, oldValue)) {
            this.jobsRunning--;
            return newValue;
        }
        this.pathSet(split, newValue, this.data);
        options = __assign({}, defaultUpdateOptions, options);
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
        var alreadyNotified = this.notifySubscribedListeners(updatePath, newValue, options);
        if (this.canBeNested(newValue)) {
            this.notifyNestedListeners(updatePath, newValue, options, "update", alreadyNotified);
        }
        this.executeWaitingListeners(updatePath);
        this.jobsRunning--;
        return newValue;
    };
    DeepState.prototype.get = function (userPath) {
        if (userPath === void 0) { userPath = undefined; }
        if (typeof userPath === "undefined" || userPath === "") {
            return this.data;
        }
        return this.pathGet(this.split(userPath), this.data);
    };
    DeepState.prototype.debugSubscribe = function (listener, listenersCollection, listenerPath) {
        if (listener.options.debug) {
            this.options.log("listener subscribed", {
                listenerPath: listenerPath,
                listener: listener,
                listenersCollection: listenersCollection
            });
        }
    };
    DeepState.prototype.debugListener = function (time, groupedListener) {
        if (groupedListener.eventInfo.options.debug || groupedListener.listener.options.debug) {
            this.options.log("Listener fired", {
                time: Date.now() - time,
                info: groupedListener
            });
        }
    };
    DeepState.prototype.debugTime = function (groupedListener) {
        return groupedListener.listener.options.debug || groupedListener.eventInfo.options.debug ? Date.now() : 0;
    };
    return DeepState;
}());
exports["default"] = DeepState;
exports.State = DeepState;
