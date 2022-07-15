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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var wildcard_object_scan_1 = require("./wildcard-object-scan");
var ObjectPath_1 = require("./ObjectPath");
var wildcard_matcher_js_1 = require("./wildcard_matcher.js");
var defaultUpdateOptions = {
    only: [],
    source: "",
    debug: false,
    data: undefined,
    queue: false,
    force: false
};
function log(message, info) {
    console.debug(message, info);
}
function getDefaultOptions() {
    return {
        delimiter: ".",
        debug: false,
        extraDebug: false,
        useMute: true,
        notRecursive: ";",
        param: ":",
        wildcard: "*",
        experimentalMatch: false,
        queue: false,
        defaultBulkValue: true,
        useCache: false,
        useSplitCache: false,
        useIndicesCache: false,
        maxSimultaneousJobs: 1000,
        maxQueueRuns: 1000,
        log: log,
        Promise: Promise
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
var DeepState = /** @class */ (function () {
    function DeepState(data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
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
        this.options = __assign(__assign({}, getDefaultOptions()), options);
        this.data = data;
        this.id = 0;
        if (!this.options.useCache) {
            this.pathGet = ObjectPath_1["default"].get;
            this.pathSet = ObjectPath_1["default"].set;
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
        this.scan = new wildcard_object_scan_1["default"](this.data, this.options.delimiter, this.options.wildcard);
        this.destroyed = false;
    }
    DeepState.prototype.getDefaultListenerOptions = function () {
        return {
            bulk: false,
            bulkValue: this.options.defaultBulkValue,
            debug: false,
            source: "",
            data: undefined,
            queue: false,
            group: false
        };
    };
    DeepState.prototype.cacheGet = function (pathChunks, data, create) {
        if (data === void 0) { data = this.data; }
        if (create === void 0) { create = false; }
        var path = pathChunks.join(this.options.delimiter);
        var weakRefValue = this.cache.get(path);
        if (weakRefValue) {
            var value_1 = weakRefValue.deref();
            if (value_1) {
                return value_1;
            }
        }
        var value = ObjectPath_1["default"].get(pathChunks, data, create);
        if (isObject(value) || Array.isArray(value)) {
            // @ts-ignore-next-line
            this.cache.set(path, new WeakRef(value));
        }
        return value;
    };
    DeepState.prototype.cacheSet = function (pathChunks, value, data) {
        if (data === void 0) { data = this.data; }
        var path = pathChunks.join(this.options.delimiter);
        if (isObject(value) || Array.isArray(value)) {
            this.cache.set(path, 
            //@ts-ignore-next-line
            new WeakRef(value));
        }
        else {
            this.cache["delete"](path);
        }
        return ObjectPath_1["default"].set(pathChunks, value, data);
    };
    /**
     * Silently update data
     * @param path string
     * @param value any
     * @returns
     */
    DeepState.prototype.silentSet = function (path, value) {
        return this.pathSet(this.split(path), value, this.data);
    };
    DeepState.prototype.loadWasmMatcher = function (pathToWasmFile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, wildcard_matcher_js_1["default"])(pathToWasmFile)];
                    case 1:
                        _a.sent();
                        this.is_match = wildcard_matcher_js_1.is_match;
                        this.scan = new wildcard_object_scan_1["default"](this.data, this.options.delimiter, this.options.wildcard, this.is_match);
                        return [2 /*return*/];
                }
            });
        });
    };
    DeepState.prototype.same = function (newValue, oldValue) {
        return ((["number", "string", "undefined", "boolean"].includes(typeof newValue) || newValue === null) &&
            oldValue === newValue);
    };
    DeepState.prototype.getListeners = function () {
        return this.listeners;
    };
    DeepState.prototype.destroy = function () {
        this.destroyed = true;
        this.data = undefined;
        this.listeners = new Map();
        this.waitingListeners = new Map();
        this.updateQueue = [];
        this.jobsRunning = 0;
    };
    DeepState.prototype.match = function (first, second, nested) {
        if (nested === void 0) { nested = true; }
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
    };
    DeepState.prototype.getIndicesOf = function (searchStr, str) {
        if (this.options.useIndicesCache && this.indices.has(str))
            return this.indices.get(str);
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        if (this.options.useIndicesCache)
            this.indices.set(str, indices);
        return indices;
    };
    DeepState.prototype.getIndicesCount = function (searchStr, str) {
        if (this.options.useIndicesCache && this.indicesCount.has(str))
            return this.indicesCount.get(str);
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return 0;
        }
        var startIndex = 0, index, indices = 0;
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices++;
            startIndex = index + searchStrLen;
        }
        if (this.options.useIndicesCache)
            this.indicesCount.set(str, indices);
        return indices;
    };
    DeepState.prototype.cutPath = function (longer, shorter) {
        if (shorter === "")
            return "";
        longer = this.cleanNotRecursivePath(longer);
        shorter = this.cleanNotRecursivePath(shorter);
        if (longer === shorter)
            return longer;
        var shorterPartsLen = this.getIndicesCount(this.options.delimiter, shorter);
        var longerParts = this.getIndicesOf(this.options.delimiter, longer);
        return longer.substring(0, longerParts[shorterPartsLen]);
    };
    DeepState.prototype.trimPath = function (path) {
        path = this.cleanNotRecursivePath(path);
        if (path.charAt(0) === this.options.delimiter) {
            return path.substr(1);
        }
        return path;
    };
    DeepState.prototype.split = function (path) {
        if (path === "")
            return [];
        if (!this.options.useSplitCache) {
            return path.split(this.options.delimiter);
        }
        var fromCache = this.splitCache.get(path);
        if (fromCache) {
            return fromCache.slice();
        }
        var value = path.split(this.options.delimiter);
        this.splitCache.set(path, value.slice());
        return value;
    };
    DeepState.prototype.isWildcard = function (path) {
        return path.includes(this.options.wildcard) || this.hasParams(path);
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
                var reg = new RegExp("\\" + this.options.param + "([^\\" + this.options.delimiter + "\\" + this.options.param + "]+)", "g");
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
        paramsInfo.replaced = fullReplaced.join(this.options.delimiter);
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
        if (this.destroyed)
            return;
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
        if (options === void 0) { options = this.getDefaultListenerOptions(); }
        if (this.destroyed)
            return function () { };
        var unsubscribers = [];
        var index = 0;
        var groupId = null;
        if (typeof options.group === "boolean" && options.group) {
            this.groupId++;
            groupId = this.groupId;
            options.bulk = true;
        }
        else if (typeof options.group === "string") {
            options.bulk = true;
            groupId = options.group;
        }
        try {
            for (var userPaths_2 = __values(userPaths), userPaths_2_1 = userPaths_2.next(); !userPaths_2_1.done; userPaths_2_1 = userPaths_2.next()) {
                var userPath = userPaths_2_1.value;
                unsubscribers.push(this.subscribe(userPath, fn, options, {
                    all: userPaths,
                    index: index,
                    groupId: groupId
                }));
                index++;
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
        return __assign({ listeners: new Map(), isRecursive: false, isWildcard: false, hasParams: false, match: undefined, paramsInfo: undefined, path: undefined, originalPath: undefined, count: 0 }, values);
    };
    DeepState.prototype.getCleanListener = function (fn, options) {
        if (options === void 0) { options = this.getDefaultListenerOptions(); }
        return {
            fn: fn,
            options: __assign(__assign({}, this.getDefaultListenerOptions()), options),
            groupId: null
        };
    };
    DeepState.prototype.getListenerCollectionMatch = function (listenerPath, isRecursive, isWildcard) {
        listenerPath = this.cleanNotRecursivePath(listenerPath);
        var self = this;
        return function listenerCollectionMatch(path, debug) {
            if (debug === void 0) { debug = false; }
            var scopedListenerPath = listenerPath;
            if (isRecursive) {
                path = self.cutPath(path, listenerPath);
            }
            else {
                scopedListenerPath = self.cutPath(self.cleanNotRecursivePath(listenerPath), path);
            }
            if (debug) {
                console.log("[getListenerCollectionMatch]", {
                    listenerPath: listenerPath,
                    scopedListenerPath: scopedListenerPath,
                    path: path,
                    isRecursive: isRecursive,
                    isWildcard: isWildcard
                });
            }
            if (isWildcard && self.match(scopedListenerPath, path, isRecursive))
                return true;
            return scopedListenerPath === path;
        };
    };
    DeepState.prototype.getListenersCollection = function (listenerPath, listener) {
        if (this.listeners.has(listenerPath)) {
            var listenersCollection_1 = this.listeners.get(listenerPath);
            listenersCollection_1.listeners.set(++this.id, listener);
            listener.id = this.id;
            return listenersCollection_1;
        }
        var hasParams = this.hasParams(listenerPath);
        var paramsInfo;
        if (hasParams) {
            paramsInfo = this.getParamsInfo(listenerPath);
        }
        var collCfg = {
            isRecursive: !this.isNotRecursive(listenerPath),
            isWildcard: this.isWildcard(listenerPath),
            hasParams: hasParams,
            paramsInfo: paramsInfo,
            originalPath: listenerPath,
            path: hasParams ? paramsInfo.replaced : listenerPath
        };
        if (!collCfg.isRecursive) {
            collCfg.path = this.cleanNotRecursivePath(collCfg.path);
        }
        var listenersCollection = this.getCleanListenersCollection(__assign(__assign({}, collCfg), { match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard) }));
        this.id++;
        listenersCollection.listeners.set(this.id, listener);
        listener.id = this.id;
        this.listeners.set(collCfg.originalPath, listenersCollection);
        return listenersCollection;
    };
    DeepState.prototype.subscribe = function (listenerPath, fn, options, subscribeAllOptions) {
        if (options === void 0) { options = this.getDefaultListenerOptions(); }
        if (subscribeAllOptions === void 0) { subscribeAllOptions = {
            all: [listenerPath],
            index: 0,
            groupId: null
        }; }
        if (this.destroyed)
            return function () { };
        this.jobsRunning++;
        var type = "subscribe";
        var listener = this.getCleanListener(fn, options);
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
        var listenersCollection = this.getListenersCollection(listenerPath, listener);
        if (options.debug) {
            console.log("[subscribe]", { listenerPath: listenerPath, options: options });
        }
        listenersCollection.count++;
        var shouldFire = true;
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
            var cleanPath = this.cleanNotRecursivePath(listenersCollection.path);
            var cleanPathChunks = this.split(cleanPath);
            if (!listenersCollection.isWildcard) {
                if (!this.isMuted(cleanPath) && !this.isMuted(fn)) {
                    fn(this.pathGet(cleanPathChunks, this.data), {
                        type: type,
                        listener: listener,
                        listenersCollection: listenersCollection,
                        path: {
                            listener: listenerPath,
                            update: undefined,
                            resolved: this.cleanNotRecursivePath(listenerPath)
                        },
                        params: this.getParams(listenersCollection.paramsInfo, cleanPath),
                        options: options
                    });
                }
            }
            else {
                var paths = this.scan.get(cleanPath);
                if (options.bulk) {
                    var bulkValue = [];
                    for (var path in paths) {
                        if (this.isMuted(path))
                            continue;
                        bulkValue.push({
                            path: path,
                            params: this.getParams(listenersCollection.paramsInfo, path),
                            value: paths[path]
                        });
                    }
                    if (!this.isMuted(fn)) {
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
                }
                else {
                    for (var path in paths) {
                        if (!this.isMuted(path) && !this.isMuted(fn)) {
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
    DeepState.prototype.runQueuedListeners = function () {
        var _this = this;
        if (this.destroyed)
            return;
        if (this.subscribeQueue.length === 0)
            return;
        if (this.jobsRunning === 0) {
            this.queueRuns = 0;
            var queue = __spreadArray([], __read(this.subscribeQueue), false);
            for (var i = 0, len = queue.length; i < len; i++) {
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
                    .then(function () { return _this.runQueuedListeners(); })["catch"](function (e) {
                    throw e;
                });
            }
        }
    };
    DeepState.prototype.getQueueNotifyListeners = function (groupedListeners, queue) {
        var e_6, _a, e_7, _b;
        var _this = this;
        if (queue === void 0) { queue = []; }
        for (var path in groupedListeners) {
            if (this.isMuted(path))
                continue;
            var _c = groupedListeners[path], single = _c.single, bulk = _c.bulk;
            var _loop_1 = function (singleListener) {
                var e_8, _d;
                var alreadyInQueue = false;
                var resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.resolved;
                if (!singleListener.eventInfo.path.resolved) {
                    resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.listener;
                }
                try {
                    for (var queue_1 = (e_8 = void 0, __values(queue)), queue_1_1 = queue_1.next(); !queue_1_1.done; queue_1_1 = queue_1.next()) {
                        var excludedListener = queue_1_1.value;
                        if (resolvedIdPath === excludedListener.resolvedIdPath) {
                            alreadyInQueue = true;
                            break;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (queue_1_1 && !queue_1_1.done && (_d = queue_1["return"])) _d.call(queue_1);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                if (alreadyInQueue) {
                    return "continue";
                }
                var time = this_1.debugTime(singleListener);
                if (!this_1.isMuted(singleListener.listener.fn)) {
                    if (singleListener.listener.options.queue && this_1.jobsRunning) {
                        this_1.subscribeQueue.push(function () {
                            singleListener.listener.fn(singleListener.value ? singleListener.value() : undefined, singleListener.eventInfo);
                        });
                    }
                    else {
                        var resolvedIdPath_1 = singleListener.listener.id + ":" + singleListener.eventInfo.path.resolved;
                        if (!singleListener.eventInfo.path.resolved) {
                            resolvedIdPath_1 = singleListener.listener.id + ":" + singleListener.eventInfo.path.listener;
                        }
                        queue.push({
                            id: singleListener.listener.id,
                            resolvedPath: singleListener.eventInfo.path.resolved,
                            resolvedIdPath: resolvedIdPath_1,
                            originalFn: singleListener.listener.fn,
                            fn: function () {
                                singleListener.listener.fn(singleListener.value ? singleListener.value() : undefined, singleListener.eventInfo);
                            },
                            options: singleListener.listener.options,
                            groupId: singleListener.listener.groupId
                        });
                    }
                }
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
                var e_9, _e, e_10, _f;
                var alreadyInQueue = false;
                try {
                    for (var queue_2 = (e_9 = void 0, __values(queue)), queue_2_1 = queue_2.next(); !queue_2_1.done; queue_2_1 = queue_2.next()) {
                        var excludedListener = queue_2_1.value;
                        if (excludedListener.id === bulkListener.listener.id) {
                            alreadyInQueue = true;
                            break;
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (queue_2_1 && !queue_2_1.done && (_e = queue_2["return"])) _e.call(queue_2);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                if (alreadyInQueue)
                    return "continue";
                var time = this_2.debugTime(bulkListener);
                var bulkValue = [];
                try {
                    for (var _g = (e_10 = void 0, __values(bulkListener.value)), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var bulk_2 = _h.value;
                        bulkValue.push(__assign(__assign({}, bulk_2), { value: bulk_2.value ? bulk_2.value() : undefined }));
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_f = _g["return"])) _f.call(_g);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                if (!this_2.isMuted(bulkListener.listener.fn)) {
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
                        var resolvedIdPath = bulkListener.listener.id + ":" + bulkListener.eventInfo.path.resolved;
                        if (!bulkListener.eventInfo.path.resolved) {
                            resolvedIdPath = bulkListener.listener.id + ":" + bulkListener.eventInfo.path.listener;
                        }
                        queue.push({
                            id: bulkListener.listener.id,
                            resolvedPath: bulkListener.eventInfo.path.resolved,
                            resolvedIdPath: resolvedIdPath,
                            originalFn: bulkListener.listener.fn,
                            fn: function () {
                                bulkListener.listener.fn(bulkValue, bulkListener.eventInfo);
                            },
                            options: bulkListener.listener.options,
                            groupId: bulkListener.listener.groupId
                        });
                    }
                }
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
        return queue;
    };
    DeepState.prototype.shouldIgnore = function (listener, updatePath) {
        var e_11, _a;
        if (!listener.options.ignore)
            return false;
        try {
            for (var _b = __values(listener.options.ignore), _c = _b.next(); !_c.done; _c = _b.next()) {
                var ignorePath = _c.value;
                if (updatePath.startsWith(ignorePath)) {
                    return true;
                }
                if (this.is_match && this.is_match(ignorePath, updatePath)) {
                    return true;
                }
                else {
                    var cuttedUpdatePath = this.cutPath(updatePath, ignorePath);
                    if (this.match(ignorePath, cuttedUpdatePath)) {
                        return true;
                    }
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return false;
    };
    DeepState.prototype.getSubscribedListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_12, _a;
        var _this = this;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        options = __assign(__assign({}, defaultUpdateOptions), options);
        var listeners = {};
        var _loop_3 = function (listenerPath, listenersCollection) {
            var e_13, _e, e_14, _f;
            if (listenersCollection.match(updatePath)) {
                listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
                var params = listenersCollection.paramsInfo
                    ? this_3.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                var cutPath_1 = this_3.cutPath(updatePath, listenerPath);
                var traverse = listenersCollection.isRecursive || listenersCollection.isWildcard;
                var value = traverse ? function () { return _this.get(cutPath_1); } : function () { return newValue; };
                var bulkValue = [{ value: value, path: updatePath, params: params }];
                try {
                    for (var _g = (e_13 = void 0, __values(listenersCollection.listeners.values())), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var listener = _h.value;
                        if (this_3.shouldIgnore(listener, updatePath)) {
                            if (listener.options.debug) {
                                console.log("[getSubscribedListeners] Listener was not fired because it was ignored.", {
                                    listener: listener,
                                    listenersCollection: listenersCollection
                                });
                            }
                            continue;
                        }
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
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_e = _g["return"])) _e.call(_g);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
            }
            else if (this_3.options.extraDebug) {
                // debug
                var showMatch = false;
                try {
                    for (var _j = (e_14 = void 0, __values(listenersCollection.listeners.values())), _k = _j.next(); !_k.done; _k = _j.next()) {
                        var listener = _k.value;
                        if (listener.options.debug) {
                            showMatch = true;
                            console.log("[getSubscribedListeners] Listener was not fired because there was no match.", {
                                listener: listener,
                                listenersCollection: listenersCollection,
                                updatePath: updatePath
                            });
                        }
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (_k && !_k.done && (_f = _j["return"])) _f.call(_j);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
                if (showMatch) {
                    listenersCollection.match(updatePath, true);
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
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_12) throw e_12.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifySubscribedListeners = function (updatePath, newValue, options, type, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        return this.getQueueNotifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
    };
    DeepState.prototype.useBulkValue = function (listenersCollection) {
        var e_15, _a;
        try {
            for (var _b = __values(listenersCollection.listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), listenerId = _d[0], listener = _d[1];
                if (listener.options.bulk && listener.options.bulkValue)
                    return true;
                if (!listener.options.bulk)
                    return true;
            }
        }
        catch (e_15_1) { e_15 = { error: e_15_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_15) throw e_15.error; }
        }
        return false;
    };
    DeepState.prototype.getNestedListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_16, _a;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        var listeners = {};
        var restBelowValues = {};
        var _loop_4 = function (listenerPath, listenersCollection) {
            var e_17, _e, e_18, _f;
            if (!listenersCollection.isRecursive)
                return "continue";
            // listenerPath may be longer and is shortened - because we want to get listeners underneath change
            var currentAbovePathCut = this_4.cutPath(listenerPath, updatePath);
            if (this_4.match(currentAbovePathCut, updatePath)) {
                listeners[listenerPath] = { single: [], bulk: [] };
                // listener is listening below updated node
                var restBelowPathCut = this_4.trimPath(listenerPath.substr(currentAbovePathCut.length));
                var useBulkValue = this_4.useBulkValue(listenersCollection);
                var wildcardNewValues_1;
                if (useBulkValue) {
                    wildcardNewValues_1 = restBelowValues[restBelowPathCut]
                        ? restBelowValues[restBelowPathCut] // if those values are already calculated use it
                        : new wildcard_object_scan_1["default"](newValue, this_4.options.delimiter, this_4.options.wildcard).get(restBelowPathCut);
                    restBelowValues[restBelowPathCut] = wildcardNewValues_1;
                }
                var params = listenersCollection.paramsInfo
                    ? this_4.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                var bulk = [];
                var bulkListeners = {};
                try {
                    for (var _g = (e_17 = void 0, __values(listenersCollection.listeners)), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var _j = __read(_h.value, 2), listenerId = _j[0], listener = _j[1];
                        if (useBulkValue) {
                            var _loop_5 = function (currentRestPath) {
                                var value = function () { return wildcardNewValues_1[currentRestPath]; };
                                var fullPath = [updatePath, currentRestPath].join(this_4.options.delimiter);
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
                                if (this_4.shouldIgnore(listener, updatePath))
                                    return "continue";
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
                            };
                            for (var currentRestPath in wildcardNewValues_1) {
                                _loop_5(currentRestPath);
                            }
                        }
                        else {
                            var eventInfo = {
                                type: type,
                                listener: listener,
                                listenersCollection: listenersCollection,
                                path: {
                                    listener: listenerPath,
                                    update: originalPath ? originalPath : updatePath,
                                    resolved: undefined
                                },
                                params: params,
                                options: options
                            };
                            if (this_4.shouldIgnore(listener, updatePath))
                                continue;
                            if (listener.options.bulk) {
                                bulk.push({ value: undefined, path: undefined, params: params });
                                bulkListeners[listenerId] = listener;
                            }
                            else {
                                listeners[listenerPath].single.push({
                                    listener: listener,
                                    listenersCollection: listenersCollection,
                                    eventInfo: eventInfo,
                                    value: undefined
                                });
                            }
                        }
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_e = _g["return"])) _e.call(_g);
                    }
                    finally { if (e_17) throw e_17.error; }
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
            else if (this_4.options.extraDebug) {
                try {
                    // debug
                    for (var _k = (e_18 = void 0, __values(listenersCollection.listeners.values())), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var listener = _l.value;
                        if (listener.options.debug) {
                            console.log("[getNestedListeners] Listener was not fired because there was no match.", {
                                listener: listener,
                                listenersCollection: listenersCollection,
                                currentCutPath: currentAbovePathCut,
                                updatePath: updatePath
                            });
                        }
                    }
                }
                catch (e_18_1) { e_18 = { error: e_18_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_f = _k["return"])) _f.call(_k);
                    }
                    finally { if (e_18) throw e_18.error; }
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
        catch (e_16_1) { e_16 = { error: e_16_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_16) throw e_16.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifyNestedListeners = function (updatePath, newValue, options, type, queue, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        return this.getQueueNotifyListeners(this.getNestedListeners(updatePath, newValue, options, type, originalPath), queue);
    };
    DeepState.prototype.getNotifyOnlyListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_19, _a;
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
            var wildcardScanNewValue = new wildcard_object_scan_1["default"](newValue, this_5.options.delimiter, this_5.options.wildcard).get(notifyPath);
            listeners[notifyPath] = { bulk: [], single: [] };
            var _loop_7 = function (wildcardPath) {
                var e_20, _d, e_21, _e;
                var fullPath = updatePath + this_5.options.delimiter + wildcardPath;
                try {
                    for (var _f = (e_20 = void 0, __values(this_5.listeners)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var _h = __read(_g.value, 2), listenerPath = _h[0], listenersCollection = _h[1];
                        var params = listenersCollection.paramsInfo
                            ? this_5.getParams(listenersCollection.paramsInfo, fullPath)
                            : undefined;
                        if (this_5.match(listenerPath, fullPath)) {
                            var value = function () { return wildcardScanNewValue[wildcardPath]; };
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
                                if (this_5.shouldIgnore(listener, updatePath))
                                    return "continue";
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
                                for (var _j = (e_21 = void 0, __values(listenersCollection.listeners.values())), _k = _j.next(); !_k.done; _k = _j.next()) {
                                    var listener = _k.value;
                                    _loop_8(listener);
                                }
                            }
                            catch (e_21_1) { e_21 = { error: e_21_1 }; }
                            finally {
                                try {
                                    if (_k && !_k.done && (_e = _j["return"])) _e.call(_j);
                                }
                                finally { if (e_21) throw e_21.error; }
                            }
                        }
                    }
                }
                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_d = _f["return"])) _d.call(_f);
                    }
                    finally { if (e_20) throw e_20.error; }
                }
            };
            for (var wildcardPath in wildcardScanNewValue) {
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
        catch (e_19_1) { e_19 = { error: e_19_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_19) throw e_19.error; }
        }
        return listeners;
    };
    DeepState.prototype.runQueue = function (queue) {
        var e_22, _a;
        var firedGroups = [];
        try {
            for (var queue_3 = __values(queue), queue_3_1 = queue_3.next(); !queue_3_1.done; queue_3_1 = queue_3.next()) {
                var q = queue_3_1.value;
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
        catch (e_22_1) { e_22 = { error: e_22_1 }; }
        finally {
            try {
                if (queue_3_1 && !queue_3_1.done && (_a = queue_3["return"])) _a.call(queue_3);
            }
            finally { if (e_22) throw e_22.error; }
        }
    };
    DeepState.prototype.sortAndRunQueue = function (queue, path) {
        queue.sort(function (a, b) {
            return a.id - b.id;
        });
        if (this.options.debug) {
            console.log("[deep-state-observer] queue for " + path, queue);
        }
        this.runQueue(queue);
    };
    DeepState.prototype.notifyOnly = function (updatePath, newValue, options, type, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = ""; }
        var queue = this.getQueueNotifyListeners(this.getNotifyOnlyListeners(updatePath, newValue, options, type, originalPath));
        this.sortAndRunQueue(queue, updatePath);
    };
    DeepState.prototype.canBeNested = function (newValue) {
        return typeof newValue === "object" && newValue !== null;
    };
    DeepState.prototype.getUpdateValues = function (oldValue, fn) {
        var newValue = fn;
        if (typeof fn === "function") {
            newValue = fn(oldValue);
        }
        return { newValue: newValue, oldValue: oldValue };
    };
    DeepState.prototype.wildcardNotify = function (groupedListenersPack, waitingPaths) {
        var e_23, _a, e_24, _b;
        var queue = [];
        try {
            for (var groupedListenersPack_1 = __values(groupedListenersPack), groupedListenersPack_1_1 = groupedListenersPack_1.next(); !groupedListenersPack_1_1.done; groupedListenersPack_1_1 = groupedListenersPack_1.next()) {
                var groupedListeners = groupedListenersPack_1_1.value;
                this.getQueueNotifyListeners(groupedListeners, queue);
            }
        }
        catch (e_23_1) { e_23 = { error: e_23_1 }; }
        finally {
            try {
                if (groupedListenersPack_1_1 && !groupedListenersPack_1_1.done && (_a = groupedListenersPack_1["return"])) _a.call(groupedListenersPack_1);
            }
            finally { if (e_23) throw e_23.error; }
        }
        try {
            for (var waitingPaths_1 = __values(waitingPaths), waitingPaths_1_1 = waitingPaths_1.next(); !waitingPaths_1_1.done; waitingPaths_1_1 = waitingPaths_1.next()) {
                var path = waitingPaths_1_1.value;
                this.executeWaitingListeners(path);
            }
        }
        catch (e_24_1) { e_24 = { error: e_24_1 }; }
        finally {
            try {
                if (waitingPaths_1_1 && !waitingPaths_1_1.done && (_b = waitingPaths_1["return"])) _b.call(waitingPaths_1);
            }
            finally { if (e_24) throw e_24.error; }
        }
        this.jobsRunning--;
        return queue;
    };
    DeepState.prototype.wildcardUpdate = function (updatePath, fn, options, multi) {
        if (options === void 0) { options = defaultUpdateOptions; }
        if (multi === void 0) { multi = false; }
        ++this.jobsRunning;
        options = __assign(__assign({}, defaultUpdateOptions), options);
        var scanned = this.scan.get(updatePath);
        var updated = {};
        for (var path in scanned) {
            var split = this.split(path);
            var _a = this.getUpdateValues(scanned[path], fn), oldValue = _a.oldValue, newValue = _a.newValue;
            if (!this.same(newValue, oldValue) || options.force) {
                this.pathSet(split, newValue, this.data);
                updated[path] = newValue;
            }
        }
        var groupedListenersPack = [];
        var waitingPaths = [];
        for (var path in updated) {
            var newValue = updated[path];
            if (options.only.length) {
                groupedListenersPack.push(this.getNotifyOnlyListeners(path, newValue, options, "update", updatePath));
            }
            else {
                groupedListenersPack.push(this.getSubscribedListeners(path, newValue, options, "update", updatePath));
                if (this.canBeNested(newValue)) {
                    groupedListenersPack.push(this.getNestedListeners(path, newValue, options, "update", updatePath));
                }
            }
            options.debug && this.options.log("Wildcard update", { path: path, newValue: newValue });
            waitingPaths.push(path);
        }
        if (multi) {
            var self_1 = this;
            return function () {
                var queue = self_1.wildcardNotify(groupedListenersPack, waitingPaths);
                self_1.sortAndRunQueue(queue, updatePath);
            };
        }
        var queue = this.wildcardNotify(groupedListenersPack, waitingPaths);
        this.sortAndRunQueue(queue, updatePath);
    };
    DeepState.prototype.runUpdateQueue = function () {
        if (this.destroyed)
            return;
        while (this.updateQueue.length && this.updateQueue.length < this.options.maxSimultaneousJobs) {
            var params = this.updateQueue.shift();
            params.options.queue = false; // prevent infinite loop
            this.update(params.updatePath, params.fnOrValue, params.options, params.multi);
        }
    };
    DeepState.prototype.updateNotify = function (updatePath, newValue, options) {
        var queue = this.notifySubscribedListeners(updatePath, newValue, options);
        if (this.canBeNested(newValue)) {
            this.notifyNestedListeners(updatePath, newValue, options, "update", queue);
        }
        this.sortAndRunQueue(queue, updatePath);
        this.executeWaitingListeners(updatePath);
    };
    DeepState.prototype.updateNotifyAll = function (updateStack) {
        var e_25, _a;
        var queue = [];
        try {
            for (var updateStack_1 = __values(updateStack), updateStack_1_1 = updateStack_1.next(); !updateStack_1_1.done; updateStack_1_1 = updateStack_1.next()) {
                var current = updateStack_1_1.value;
                var value = current.newValue;
                if (this.tracing.length) {
                    var traceId = this.tracing[this.tracing.length - 1];
                    var trace = this.traceMap.get(traceId);
                    trace.changed.push({
                        traceId: traceId,
                        updatePath: current.updatePath,
                        fnOrValue: value,
                        options: current.options
                    });
                    this.traceMap.set(traceId, trace);
                }
                queue = queue.concat(this.notifySubscribedListeners(current.updatePath, value, current.options));
                if (this.canBeNested(current.newValue)) {
                    this.notifyNestedListeners(current.updatePath, value, current.options, "update", queue);
                }
            }
        }
        catch (e_25_1) { e_25 = { error: e_25_1 }; }
        finally {
            try {
                if (updateStack_1_1 && !updateStack_1_1.done && (_a = updateStack_1["return"])) _a.call(updateStack_1);
            }
            finally { if (e_25) throw e_25.error; }
        }
        this.runQueue(queue);
    };
    DeepState.prototype.updateNotifyOnly = function (updatePath, newValue, options) {
        this.notifyOnly(updatePath, newValue, options);
        this.executeWaitingListeners(updatePath);
    };
    DeepState.prototype.update = function (updatePath, fnOrValue, options, multi) {
        var _this = this;
        if (options === void 0) { options = __assign({}, defaultUpdateOptions); }
        if (multi === void 0) { multi = false; }
        if (this.destroyed)
            return;
        if (this.collection) {
            return this.collection.update(updatePath, fnOrValue, options);
        }
        if (this.tracing.length) {
            var traceId = this.tracing[this.tracing.length - 1];
            var trace = this.traceMap.get(traceId);
            trace.changed.push({ traceId: traceId, updatePath: updatePath, fnOrValue: fnOrValue, options: options });
            this.traceMap.set(traceId, trace);
        }
        var jobsRunning = this.jobsRunning;
        if ((this.options.queue || options.queue) && jobsRunning) {
            if (jobsRunning > this.options.maxSimultaneousJobs) {
                throw new Error("Maximal simultaneous jobs limit reached.");
            }
            this.updateQueue.push({ updatePath: updatePath, fnOrValue: fnOrValue, options: options, multi: multi });
            var result_1 = Promise.resolve().then(function () {
                _this.runUpdateQueue();
            });
            if (multi) {
                return function () {
                    return result_1;
                };
            }
            return result_1;
        }
        if (this.isWildcard(updatePath)) {
            return this.wildcardUpdate(updatePath, fnOrValue, options, multi);
        }
        ++this.jobsRunning;
        var split = this.split(updatePath);
        var currentValue = this.pathGet(split, this.data);
        var _a = this.getUpdateValues(currentValue, fnOrValue), oldValue = _a.oldValue, newValue = _a.newValue;
        if (options.debug) {
            this.options.log("Updating " + updatePath + " " + (options.source ? "from " + options.source : ""), {
                oldValue: oldValue,
                newValue: newValue
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
        options = __assign(__assign({}, defaultUpdateOptions), options);
        if (options.only === null) {
            --this.jobsRunning;
            if (multi)
                return function () { };
            return newValue;
        }
        if (options.only.length) {
            --this.jobsRunning;
            if (multi) {
                var self_2 = this;
                return function () {
                    var result = self_2.updateNotifyOnly(updatePath, newValue, options);
                    return result;
                };
            }
            this.updateNotifyOnly(updatePath, newValue, options);
            return newValue;
        }
        if (multi) {
            --this.jobsRunning;
            var self_3 = this;
            return function multiUpdate() {
                var result = self_3.updateNotify(updatePath, newValue, options);
                return result;
            };
        }
        this.updateNotify(updatePath, newValue, options);
        --this.jobsRunning;
        return newValue;
    };
    DeepState.prototype.multi = function (grouped) {
        if (grouped === void 0) { grouped = false; }
        if (this.destroyed)
            return {
                update: function () {
                    return this;
                },
                done: function () { },
                getStack: function () {
                    return [];
                }
            };
        if (this.collection)
            return this.collection;
        var self = this;
        var updateStack = [];
        var notifiers = [];
        var multiObject = {
            update: function (updatePath, fnOrValue, options) {
                if (options === void 0) { options = defaultUpdateOptions; }
                if (grouped) {
                    var split = self.split(updatePath);
                    var value = fnOrValue;
                    var currentValue = self.pathGet(split, self.data);
                    if (typeof value === "function") {
                        value = value(currentValue);
                    }
                    self.pathSet(split, value, self.data);
                    updateStack.push({ updatePath: updatePath, newValue: value, options: options });
                }
                else {
                    notifiers.push(self.update(updatePath, fnOrValue, options, true));
                }
                return this;
            },
            done: function () {
                var e_26, _a;
                if (self.collections !== 0) {
                    return;
                }
                if (grouped) {
                    self.updateNotifyAll(updateStack);
                }
                else {
                    try {
                        for (var notifiers_1 = __values(notifiers), notifiers_1_1 = notifiers_1.next(); !notifiers_1_1.done; notifiers_1_1 = notifiers_1.next()) {
                            var current = notifiers_1_1.value;
                            current();
                        }
                    }
                    catch (e_26_1) { e_26 = { error: e_26_1 }; }
                    finally {
                        try {
                            if (notifiers_1_1 && !notifiers_1_1.done && (_a = notifiers_1["return"])) _a.call(notifiers_1);
                        }
                        finally { if (e_26) throw e_26.error; }
                    }
                }
                updateStack.length = 0;
            },
            getStack: function () {
                return updateStack;
            }
        };
        return multiObject;
    };
    DeepState.prototype.collect = function () {
        this.collections++;
        if (!this.collection) {
            this.collection = this.multi(true);
        }
        return this.collection;
    };
    DeepState.prototype.executeCollected = function () {
        this.collections--;
        if (this.collections === 0 && this.collection) {
            var collection = this.collection;
            this.collection = null;
            collection.done();
        }
    };
    DeepState.prototype.getCollectedCount = function () {
        return this.collections;
    };
    DeepState.prototype.getCollectedStack = function () {
        if (!this.collection)
            return [];
        return this.collection.getStack();
    };
    DeepState.prototype.get = function (userPath) {
        if (userPath === void 0) { userPath = undefined; }
        if (this.destroyed)
            return;
        if (userPath === undefined || userPath === "") {
            return this.data;
        }
        if (this.isWildcard(userPath)) {
            return this.scan.get(userPath);
        }
        return this.pathGet(this.split(userPath), this.data);
    };
    DeepState.prototype.last = function (callback) {
        var _this = this;
        var last = this.lastExecs.get(callback);
        if (!last) {
            last = { calls: 0 };
            this.lastExecs.set(callback, last);
        }
        var current = ++last.calls;
        this.resolved.then(function () {
            if (current === last.calls) {
                _this.lastExecs.set(callback, { calls: 0 });
                callback();
            }
        });
    };
    DeepState.prototype.isMuted = function (pathOrListenerFunction) {
        var e_27, _a;
        if (!this.options.useMute)
            return false;
        if (typeof pathOrListenerFunction === "function") {
            return this.isMutedListener(pathOrListenerFunction);
        }
        try {
            for (var _b = __values(this.muted), _c = _b.next(); !_c.done; _c = _b.next()) {
                var mutedPath = _c.value;
                var recursive = !this.isNotRecursive(mutedPath);
                var trimmedMutedPath = this.trimPath(mutedPath);
                if (this.match(pathOrListenerFunction, trimmedMutedPath))
                    return true;
                if (this.match(trimmedMutedPath, pathOrListenerFunction))
                    return true;
                if (recursive) {
                    var cutPath = this.cutPath(trimmedMutedPath, pathOrListenerFunction);
                    if (this.match(cutPath, mutedPath))
                        return true;
                    if (this.match(mutedPath, cutPath))
                        return true;
                }
            }
        }
        catch (e_27_1) { e_27 = { error: e_27_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_27) throw e_27.error; }
        }
        return false;
    };
    DeepState.prototype.isMutedListener = function (listenerFunc) {
        return this.mutedListeners.has(listenerFunc);
    };
    DeepState.prototype.mute = function (pathOrListenerFunction) {
        if (typeof pathOrListenerFunction === "function") {
            return this.mutedListeners.add(pathOrListenerFunction);
        }
        this.muted.add(pathOrListenerFunction);
    };
    DeepState.prototype.unmute = function (pathOrListenerFunction) {
        if (typeof pathOrListenerFunction === "function") {
            return this.mutedListeners["delete"](pathOrListenerFunction);
        }
        this.muted["delete"](pathOrListenerFunction);
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
    DeepState.prototype.startTrace = function (name, additionalData) {
        if (additionalData === void 0) { additionalData = null; }
        this.traceId++;
        var id = this.traceId + ":" + name;
        this.traceMap.set(id, {
            id: id,
            sort: this.traceId,
            stack: this.tracing.map(function (i) { return i; }),
            additionalData: additionalData,
            changed: []
        });
        this.tracing.push(id);
        return id;
    };
    DeepState.prototype.stopTrace = function (id) {
        var result = this.traceMap.get(id);
        this.tracing.pop();
        this.traceMap["delete"](id);
        return result;
    };
    DeepState.prototype.saveTrace = function (id) {
        var result = this.traceMap.get(id);
        this.tracing.pop();
        this.traceMap["delete"](id);
        this.savedTrace.push(result);
        return result;
    };
    DeepState.prototype.getSavedTraces = function () {
        var savedTrace = this.savedTrace.map(function (trace) { return trace; });
        savedTrace.sort(function (a, b) {
            return a.sort - b.sort;
        });
        this.savedTrace = [];
        return savedTrace;
    };
    return DeepState;
}());
exports["default"] = DeepState;
