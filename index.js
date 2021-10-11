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
    force: false
};
function log(message, info) {
    console.debug(message, info);
}
/**
 * Is object - helper function to determine if specified variable is an object
 *
 * @param {any} item
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === "object" && item !== null && item.constructor && item.constructor.name === "Object";
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
        useObjectMaps: false,
        useProxy: false,
        maxSimultaneousJobs: 1000,
        maxQueueRuns: 1000,
        log: log,
        Promise: Promise
    };
}
var defaultListenerOptions = {
    bulk: false,
    debug: false,
    source: "",
    data: undefined,
    group: false
};
var DeepState = /** @class */ (function () {
    function DeepState(data, options) {
        var _this = this;
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        this.subscribeQueue = [];
        this.listenersIgnoreCache = new WeakMap();
        this.destroyed = false;
        this.groupId = 0;
        this.traceId = 0;
        // private pathGet: any;
        // private pathSet: any;
        this.traceMap = new Map();
        this.tracing = [];
        this.savedTrace = [];
        this.collection = null;
        this.collections = 0;
        this.proxyProperty = "___deep_state_observer___";
        this.rootProxyNode = {
            ___deep_state_observer___: {
                path: "___deep_state_observer___",
                pathChunks: ["___deep_state_observer___"],
                saving: [],
                parent: null
            }
        };
        this.handler = {
            set: function (obj, prop, value, proxy) {
                if (prop === _this.proxyProperty)
                    return true;
                if (prop in obj && (_this.same(obj[prop], value) || (_this.isProxy(value) && obj[prop] === value)))
                    return true;
                if (!obj[_this.proxyProperty].saving.includes(prop)) {
                    // we are not fired this from update
                    // change from proxy
                    var path = obj[_this.proxyProperty].path ? obj[_this.proxyProperty].path + _this.options.delimiter + prop : prop;
                    // check if any parent property is currently saving this node - if yes we are not going to notify
                    if (!_this.isSaving(obj[_this.proxyProperty].pathChunks, obj)) {
                        _this.update(path, value); // fire update to notify listeners and set isSaving
                    }
                    else {
                        // if parent node is saving current node and in meanwhile someone updates nodes below - just update it - do not notify
                        // we are not generating new map because update fn will do it for us on final object
                        var currentValue = _this.pathGet(path);
                        if (typeof value === "function") {
                            value = value(currentValue);
                        }
                        if ((_this.isProxy(value) && value === currentValue) || _this.same(value, currentValue))
                            return true;
                        if (isObject(value) || Array.isArray(value)) {
                            value = _this.makeObservable(value, path, obj);
                        }
                        obj[prop] = value;
                    }
                }
                else {
                    // change from update
                    obj[prop] = value;
                }
                return true;
            }
        };
        this.map = new Map();
        this.lastExecs = new WeakMap();
        this.listeners = new Map();
        this.handler.set = this.handler.set.bind(this);
        this.options = __assign(__assign({}, getDefaultOptions()), options);
        //if (this.options.useProxy) this.options.useObjectMaps = true;
        if (this.options.useProxy) {
            if (this.options.useObjectMaps) {
                this.data = this.updateMapDown("", data, this.rootProxyNode, false);
            }
            else {
                this.data = this.makeObservable(data, "", this.rootProxyNode);
            }
            this.proxy = this.data;
            this.$$$ = this.proxy;
        }
        else {
            this.data = data;
        }
        this.id = 0;
        if (!this.options.useObjectMaps) {
            this.pathGet = function (path) {
                return ObjectPath_1["default"].get(_this.split(path), _this.data);
            };
            this.pathSet = function (pathChunks, value) {
                return ObjectPath_1["default"].set(pathChunks, value, _this.data);
            };
        }
        if (options.Promise) {
            this.resolved = options.Promise.resolve();
        }
        else {
            this.resolved = Promise.resolve();
        }
        this.muted = new Set();
        this.mutedListeners = new Set();
        if (this.options.useObjectMaps) {
            this.scan = new wildcard_object_scan_1["default"](this.data, this.options.delimiter, this.options.wildcard, this.map);
        }
        else {
            this.scan = new wildcard_object_scan_1["default"](this.data, this.options.delimiter, this.options.wildcard);
        }
        this.destroyed = false;
    }
    DeepState.prototype.updateMapDown = function (fullPath, value, parent, deleteReferences, map) {
        var e_1, _a;
        if (deleteReferences === void 0) { deleteReferences = true; }
        if (map === void 0) { map = this.map; }
        if (!this.options.useObjectMaps)
            return value;
        if (deleteReferences) {
            try {
                for (var _b = __values(map.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (key === this.proxyProperty)
                        continue;
                    if (key.startsWith(fullPath))
                        map["delete"](key);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (isObject(value)) {
            value = this.makeObservable(value, fullPath, parent);
            for (var prop in value) {
                if (prop === this.proxyProperty)
                    continue;
                this.updateMapDown(fullPath ? fullPath + this.options.delimiter + prop : prop, value[prop], value, false, map);
            }
        }
        else if (Array.isArray(value)) {
            value = this.makeObservable(value, fullPath, parent);
            for (var i = 0, len = value.length; i < len; i++) {
                this.updateMapDown(fullPath ? fullPath + this.options.delimiter + String(i) : String(i), value[i], value, false, map);
            }
        }
        map.set(fullPath, value);
        return value;
    };
    DeepState.prototype.deleteMapReferences = function (path) {
        var e_2, _a;
        if (!this.options.useObjectMaps)
            return;
        try {
            for (var _b = __values(this.map.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (key.startsWith(path))
                    this.map["delete"](key);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    DeepState.prototype.pathGet = function (path) {
        if (!this.options.useObjectMaps)
            return ObjectPath_1["default"].get(this.split(path), this.data);
        return this.map.get(path);
    };
    DeepState.prototype.pathSet = function (pathChunks, value) {
        var e_3, _a;
        if (!this.options.useObjectMaps)
            return ObjectPath_1["default"].set(pathChunks, value, this.data);
        var prop, currentPath = "", obj = this.data;
        if (!Array.isArray(pathChunks))
            throw new Error("Invalid path chunks");
        var chunks = pathChunks.slice();
        var last = "";
        if (chunks.length) {
            last = chunks.pop();
        }
        var referencesDeleted = false;
        var removeSavings = [];
        // create nodes if needed
        for (var i = 0, len = chunks.length; i < len; i++) {
            prop = chunks[i];
            if (currentPath) {
                currentPath += this.options.delimiter + prop;
            }
            else {
                currentPath = prop;
            }
            if (prop in obj) {
                obj = obj[prop];
                continue;
            }
            // property doesn't exists
            obj[prop] = this.makeObservable(Object.create(null), currentPath, obj);
            this.setNodeSaving(obj[prop], pathChunks[i + 1]); // do not notify anything now
            removeSavings.push([obj[prop], pathChunks[i + 1]]);
            if (!referencesDeleted) {
                this.deleteMapReferences(currentPath);
                referencesDeleted = true;
            }
            this.map.set(currentPath, obj[prop]);
            obj = obj[prop];
        }
        if (currentPath) {
            currentPath += this.options.delimiter + last;
        }
        else {
            currentPath = last;
        }
        // update down if needed
        this.setNodeSaving(obj, last);
        value = this.updateMapDown(currentPath, value, obj, !referencesDeleted);
        if (last) {
            obj[last] = value;
        }
        else {
            obj = value;
        }
        this.unsetNodeSaving(obj, last);
        try {
            for (var removeSavings_1 = __values(removeSavings), removeSavings_1_1 = removeSavings_1.next(); !removeSavings_1_1.done; removeSavings_1_1 = removeSavings_1.next()) {
                var _b = __read(removeSavings_1_1.value, 2), obj_1 = _b[0], prop_1 = _b[1];
                this.unsetNodeSaving(obj_1, prop_1);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (removeSavings_1_1 && !removeSavings_1_1.done && (_a = removeSavings_1["return"])) _a.call(removeSavings_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    DeepState.prototype.getParent = function (pathChunks, proxyNode) {
        if (!this.options.useProxy)
            return;
        if (proxyNode && typeof proxyNode[this.proxyProperty] !== "undefined")
            return proxyNode[this.proxyProperty].parent;
        if (pathChunks.length === 0)
            return this.rootProxyNode;
        var split = pathChunks.slice();
        split.pop();
        return this.pathGet(split.join(this.options.delimiter));
    };
    DeepState.prototype.isSaving = function (pathChunks, proxyNode) {
        if (!this.options.useProxy)
            return;
        var parent = this.getParent(pathChunks, proxyNode);
        if (parent) {
            if (parent[this.proxyProperty].saving.includes(pathChunks[pathChunks.length - 1]))
                return true;
            return this.isSaving(parent[this.proxyProperty].pathChunks, parent);
        }
        return false;
    };
    DeepState.prototype.setNodeSaving = function (proxyNode, prop) {
        if (!this.options.useProxy)
            return;
        proxyNode[this.proxyProperty].saving.push(String(prop));
    };
    DeepState.prototype.unsetNodeSaving = function (proxyNode, prop) {
        var e_4, _a;
        if (!this.options.useProxy)
            return;
        var saving = [];
        try {
            for (var _b = __values(proxyNode[this.proxyProperty].saving), _c = _b.next(); !_c.done; _c = _b.next()) {
                var currentProp = _c.value;
                if (currentProp !== prop)
                    saving.push(currentProp);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        proxyNode[this.proxyProperty].saving = saving;
    };
    DeepState.prototype.addSaving = function (pathChunks, proxyNode) {
        if (!this.options.useProxy)
            return;
        var parent = this.getParent(pathChunks, proxyNode);
        var changedProp = pathChunks[pathChunks.length - 1];
        if (parent)
            this.setNodeSaving(parent, changedProp);
    };
    DeepState.prototype.removeSaving = function (pathChunks, proxyNode) {
        if (!this.options.useProxy)
            return;
        var parent = this.getParent(pathChunks, proxyNode);
        if (parent) {
            var changedProp = pathChunks[pathChunks.length - 1];
            this.unsetNodeSaving(parent, changedProp);
        }
    };
    DeepState.prototype.setProxy = function (target, data) {
        if (!this.options.useProxy)
            return target;
        if (typeof target[this.proxyProperty] === "undefined") {
            Object.defineProperty(target, this.proxyProperty, {
                enumerable: false,
                writable: false,
                configurable: false,
                value: data
            });
            return new Proxy(target, this.handler);
        }
        else {
            for (var key in data) {
                target[this.proxyProperty][key] = data[key];
            }
        }
        return target;
    };
    DeepState.prototype.isProxy = function (target) {
        return typeof target[this.proxyProperty] !== "undefined";
    };
    DeepState.prototype.makeObservable = function (target, path, parent) {
        if (!this.options.useProxy)
            return target;
        if (isObject(target) || Array.isArray(target)) {
            if (typeof target[this.proxyProperty] !== "undefined") {
                var pp = target[this.proxyProperty];
                if (pp.path === path && pp.parent === parent)
                    return target;
            }
            if (isObject(target)) {
                for (var key in target) {
                    if (key === this.proxyProperty)
                        continue;
                    if ((isObject(target[key]) || Array.isArray(target[key])) && !this.isProxy(target[key])) {
                        if (this.isProxy(target))
                            this.setNodeSaving(target, key);
                        target[key] = this.makeObservable(target[key], "" + (path ? path + this.options.delimiter : "") + key, target);
                        if (this.isProxy(target))
                            this.unsetNodeSaving(target, key);
                    }
                }
            }
            else {
                for (var key = 0, len = target.length; key < len; key++) {
                    if ((isObject(target[key]) || Array.isArray(target[key])) && !this.isProxy(target[key])) {
                        if (this.isProxy(target))
                            this.setNodeSaving(target, String(key));
                        target[key] = this.makeObservable(target[key], "" + (path ? path + this.options.delimiter : "") + key, target);
                        if (this.isProxy(target))
                            this.unsetNodeSaving(target, String(key));
                    }
                }
            }
            if (!this.isProxy(target)) {
                var proxyObj = Object.create(null);
                proxyObj.path = path;
                proxyObj.pathChunks = this.split(path);
                proxyObj.saving = [];
                proxyObj.parent = parent;
                target = this.setProxy(target, proxyObj);
            }
        }
        return target;
    };
    DeepState.prototype.loadWasmMatcher = function (pathToWasmFile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, wildcard_matcher_js_1["default"])(pathToWasmFile)];
                    case 1:
                        _a.sent();
                        this.is_match = wildcard_matcher_js_1.is_match;
                        this.scan = new wildcard_object_scan_1["default"](this.data, this.options.delimiter, this.options.wildcard, this.options.useObjectMaps ? this.map : null, this.is_match);
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
        if (longer === shorter)
            return longer;
        var shorterPartsLen = this.getIndicesCount(this.options.delimiter, shorter);
        var longerParts = this.getIndicesOf(this.options.delimiter, longer);
        return longer.substr(0, longerParts[shorterPartsLen]);
    };
    DeepState.prototype.trimPath = function (path) {
        path = this.cleanNotRecursivePath(path);
        if (path.charAt(0) === this.options.delimiter) {
            return path.substr(1);
        }
        return path;
    };
    DeepState.prototype.split = function (path) {
        return path === "" ? [] : path.split(this.options.delimiter);
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
        var e_5, _a;
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
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
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
    DeepState.prototype.subscribeAll = function (userPaths, fn, options) {
        var e_6, _a;
        if (options === void 0) { options = defaultListenerOptions; }
        if (this.destroyed)
            return function () { };
        var unsubscribers = [];
        var index = 0;
        if (options.group) {
            this.groupId++;
            options.bulk = true;
        }
        try {
            for (var userPaths_1 = __values(userPaths), userPaths_1_1 = userPaths_1.next(); !userPaths_1_1.done; userPaths_1_1 = userPaths_1.next()) {
                var userPath = userPaths_1_1.value;
                unsubscribers.push(this.subscribe(userPath, fn, options, {
                    all: userPaths,
                    index: index,
                    groupId: options.group ? this.groupId : null
                }));
                index++;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (userPaths_1_1 && !userPaths_1_1.done && (_a = userPaths_1["return"])) _a.call(userPaths_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return function unsubscribe() {
            var e_7, _a;
            try {
                for (var unsubscribers_1 = __values(unsubscribers), unsubscribers_1_1 = unsubscribers_1.next(); !unsubscribers_1_1.done; unsubscribers_1_1 = unsubscribers_1.next()) {
                    var unsubscribe_1 = unsubscribers_1_1.value;
                    unsubscribe_1();
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (unsubscribers_1_1 && !unsubscribers_1_1.done && (_a = unsubscribers_1["return"])) _a.call(unsubscribers_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
    };
    DeepState.prototype.getCleanListenersCollection = function (values) {
        if (values === void 0) { values = {}; }
        return __assign({ listeners: new Map(), isRecursive: false, isWildcard: false, hasParams: false, match: undefined, paramsInfo: undefined, path: undefined, originalPath: undefined, count: 0 }, values);
    };
    DeepState.prototype.getCleanListener = function (fn, options) {
        if (options === void 0) { options = defaultListenerOptions; }
        return {
            fn: fn,
            options: __assign(__assign({}, defaultListenerOptions), options),
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
        if (options === void 0) { options = defaultListenerOptions; }
        if (subscribeAllOptions === void 0) { subscribeAllOptions = {
            all: [listenerPath],
            index: 0,
            groupId: this.groupId
        }; }
        if (this.destroyed)
            return function () { };
        var type = "subscribe";
        var listener = this.getCleanListener(fn, options);
        if (options.group)
            listener.groupId = subscribeAllOptions.groupId;
        this.listenersIgnoreCache.set(listener, { truthy: [], falsy: [] });
        var listenersCollection = this.getListenersCollection(listenerPath, listener);
        if (options.debug) {
            console.log("[subscribe]", { listenerPath: listenerPath, options: options });
        }
        listenersCollection.count++;
        if (!options.group || (options.group && subscribeAllOptions.all.length - 1 === subscribeAllOptions.index)) {
            var cleanPath = this.cleanNotRecursivePath(listenersCollection.path);
            if (!listenersCollection.isWildcard) {
                if (!this.isMuted(cleanPath) && !this.isMuted(fn)) {
                    fn(this.pathGet(cleanPath), {
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
                if (options.bulk) {
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
        if (this.destroyed)
            return;
        if (this.subscribeQueue.length === 0)
            return;
        var queue = __spreadArray([], __read(this.subscribeQueue), false);
        for (var i = 0, len = queue.length; i < len; i++) {
            queue[i]();
        }
        this.subscribeQueue.length = 0;
    };
    DeepState.prototype.getQueueNotifyListeners = function (groupedListeners, queue) {
        var e_8, _a, e_9, _b;
        var _this = this;
        if (queue === void 0) { queue = []; }
        for (var path in groupedListeners) {
            if (this.isMuted(path))
                continue;
            var _c = groupedListeners[path], single = _c.single, bulk = _c.bulk;
            var _loop_1 = function (singleListener) {
                var e_10, _d;
                var alreadyInQueue = false;
                var resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.resolved;
                if (!singleListener.eventInfo.path.resolved) {
                    resolvedIdPath = singleListener.listener.id + ":" + singleListener.eventInfo.path.listener;
                }
                try {
                    for (var queue_1 = (e_10 = void 0, __values(queue)), queue_1_1 = queue_1.next(); !queue_1_1.done; queue_1_1 = queue_1.next()) {
                        var excludedListener = queue_1_1.value;
                        if (resolvedIdPath === excludedListener.resolvedIdPath) {
                            alreadyInQueue = true;
                            break;
                        }
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (queue_1_1 && !queue_1_1.done && (_d = queue_1["return"])) _d.call(queue_1);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                if (alreadyInQueue) {
                    return "continue";
                }
                var time = this_1.debugTime(singleListener);
                if (!this_1.isMuted(singleListener.listener.fn)) {
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
                            singleListener.listener.fn(singleListener.value(), singleListener.eventInfo);
                        },
                        options: singleListener.listener.options,
                        groupId: singleListener.listener.groupId
                    });
                }
                this_1.debugListener(time, singleListener);
            };
            var this_1 = this;
            try {
                for (var single_1 = (e_8 = void 0, __values(single)), single_1_1 = single_1.next(); !single_1_1.done; single_1_1 = single_1.next()) {
                    var singleListener = single_1_1.value;
                    _loop_1(singleListener);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (single_1_1 && !single_1_1.done && (_a = single_1["return"])) _a.call(single_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
            var _loop_2 = function (bulkListener) {
                var e_11, _e, e_12, _f;
                var alreadyInQueue = false;
                try {
                    for (var queue_2 = (e_11 = void 0, __values(queue)), queue_2_1 = queue_2.next(); !queue_2_1.done; queue_2_1 = queue_2.next()) {
                        var excludedListener = queue_2_1.value;
                        if (excludedListener.id === bulkListener.listener.id) {
                            alreadyInQueue = true;
                            break;
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (queue_2_1 && !queue_2_1.done && (_e = queue_2["return"])) _e.call(queue_2);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
                if (alreadyInQueue)
                    return "continue";
                var time = this_2.debugTime(bulkListener);
                var bulkValue = [];
                try {
                    for (var _g = (e_12 = void 0, __values(bulkListener.value)), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var bulk_2 = _h.value;
                        bulkValue.push(__assign(__assign({}, bulk_2), { value: bulk_2.value() }));
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_f = _g["return"])) _f.call(_g);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
                if (!this_2.isMuted(bulkListener.listener.fn)) {
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
                this_2.debugListener(time, bulkListener);
            };
            var this_2 = this;
            try {
                for (var bulk_1 = (e_9 = void 0, __values(bulk)), bulk_1_1 = bulk_1.next(); !bulk_1_1.done; bulk_1_1 = bulk_1.next()) {
                    var bulkListener = bulk_1_1.value;
                    _loop_2(bulkListener);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (bulk_1_1 && !bulk_1_1.done && (_b = bulk_1["return"])) _b.call(bulk_1);
                }
                finally { if (e_9) throw e_9.error; }
            }
        }
        Promise.resolve().then(function () { return _this.runQueuedListeners(); });
        return queue;
    };
    DeepState.prototype.shouldIgnore = function (listener, updatePath) {
        var e_13, _a;
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
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_13) throw e_13.error; }
        }
        return false;
    };
    DeepState.prototype.getSubscribedListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_14, _a;
        var _this = this;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        options = __assign(__assign({}, defaultUpdateOptions), options);
        var listeners = {};
        var _loop_3 = function (listenerPath, listenersCollection) {
            var e_15, _e, e_16, _f;
            listeners[listenerPath] = { single: [], bulk: [], bulkData: [] };
            if (listenersCollection.match(updatePath)) {
                var params = listenersCollection.paramsInfo
                    ? this_3.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                var cutPath_1 = this_3.cutPath(updatePath, listenerPath);
                var traverse = listenersCollection.isRecursive || listenersCollection.isWildcard;
                var value = traverse ? function () { return _this.get(cutPath_1); } : function () { return newValue; };
                var bulkValue = [{ value: value, path: updatePath, params: params }];
                try {
                    for (var _g = (e_15 = void 0, __values(listenersCollection.listeners.values())), _h = _g.next(); !_h.done; _h = _g.next()) {
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
                catch (e_15_1) { e_15 = { error: e_15_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_e = _g["return"])) _e.call(_g);
                    }
                    finally { if (e_15) throw e_15.error; }
                }
            }
            else if (this_3.options.extraDebug) {
                // debug
                var showMatch = false;
                try {
                    for (var _j = (e_16 = void 0, __values(listenersCollection.listeners.values())), _k = _j.next(); !_k.done; _k = _j.next()) {
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
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (_k && !_k.done && (_f = _j["return"])) _f.call(_j);
                    }
                    finally { if (e_16) throw e_16.error; }
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
        catch (e_14_1) { e_14 = { error: e_14_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_14) throw e_14.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifySubscribedListeners = function (updatePath, newValue, options, type, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        return this.getQueueNotifyListeners(this.getSubscribedListeners(updatePath, newValue, options, type, originalPath));
    };
    DeepState.prototype.getNestedListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_17, _a;
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        var listeners = {};
        var restBelowValues = {};
        var _loop_4 = function (listenerPath, listenersCollection) {
            var e_18, _e;
            if (!listenersCollection.isRecursive)
                return "continue";
            listeners[listenerPath] = { single: [], bulk: [] };
            // listenerPath is longer and is shortened - because we want to get listeners underneath change
            var currentAbovePathCut = this_4.cutPath(listenerPath, updatePath);
            if (this_4.match(currentAbovePathCut, updatePath)) {
                // listener is listening below updated node
                var restBelowPathCut = this_4.trimPath(listenerPath.substr(currentAbovePathCut.length));
                var wildcardNewValues_1 = restBelowValues[restBelowPathCut]
                    ? restBelowValues[restBelowPathCut] // if those values are already calculated use it
                    : new wildcard_object_scan_1["default"](newValue, this_4.options.delimiter, this_4.options.wildcard).get(restBelowPathCut);
                restBelowValues[restBelowPathCut] = wildcardNewValues_1;
                var params = listenersCollection.paramsInfo
                    ? this_4.getParams(listenersCollection.paramsInfo, updatePath)
                    : undefined;
                var bulk = [];
                var bulkListeners = {};
                var _loop_5 = function (currentRestPath) {
                    var e_19, _h;
                    var value = function () { return wildcardNewValues_1[currentRestPath]; };
                    var fullPath = [updatePath, currentRestPath].join(this_4.options.delimiter);
                    try {
                        for (var _j = (e_19 = void 0, __values(listenersCollection.listeners)), _k = _j.next(); !_k.done; _k = _j.next()) {
                            var _l = __read(_k.value, 2), listenerId = _l[0], listener = _l[1];
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
                                continue;
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
                    catch (e_19_1) { e_19 = { error: e_19_1 }; }
                    finally {
                        try {
                            if (_k && !_k.done && (_h = _j["return"])) _h.call(_j);
                        }
                        finally { if (e_19) throw e_19.error; }
                    }
                };
                for (var currentRestPath in wildcardNewValues_1) {
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
            else if (this_4.options.extraDebug) {
                try {
                    // debug
                    for (var _f = (e_18 = void 0, __values(listenersCollection.listeners.values())), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var listener = _g.value;
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
                        if (_g && !_g.done && (_e = _f["return"])) _e.call(_f);
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
        catch (e_17_1) { e_17 = { error: e_17_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_17) throw e_17.error; }
        }
        return listeners;
    };
    DeepState.prototype.notifyNestedListeners = function (updatePath, newValue, options, type, queue, originalPath) {
        if (type === void 0) { type = "update"; }
        if (originalPath === void 0) { originalPath = null; }
        return this.getQueueNotifyListeners(this.getNestedListeners(updatePath, newValue, options, type, originalPath), queue);
    };
    DeepState.prototype.getNotifyOnlyListeners = function (updatePath, newValue, options, type, originalPath) {
        var e_20, _a;
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
                var e_21, _d, e_22, _e;
                var fullPath = updatePath + this_5.options.delimiter + wildcardPath;
                try {
                    for (var _f = (e_21 = void 0, __values(this_5.listeners)), _g = _f.next(); !_g.done; _g = _f.next()) {
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
                                for (var _j = (e_22 = void 0, __values(listenersCollection.listeners.values())), _k = _j.next(); !_k.done; _k = _j.next()) {
                                    var listener = _k.value;
                                    _loop_8(listener);
                                }
                            }
                            catch (e_22_1) { e_22 = { error: e_22_1 }; }
                            finally {
                                try {
                                    if (_k && !_k.done && (_e = _j["return"])) _e.call(_j);
                                }
                                finally { if (e_22) throw e_22.error; }
                            }
                        }
                    }
                }
                catch (e_21_1) { e_21 = { error: e_21_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_d = _f["return"])) _d.call(_f);
                    }
                    finally { if (e_21) throw e_21.error; }
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
        catch (e_20_1) { e_20 = { error: e_20_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_20) throw e_20.error; }
        }
        return listeners;
    };
    DeepState.prototype.runQueue = function (queue) {
        var e_23, _a;
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
        catch (e_23_1) { e_23 = { error: e_23_1 }; }
        finally {
            try {
                if (queue_3_1 && !queue_3_1.done && (_a = queue_3["return"])) _a.call(queue_3);
            }
            finally { if (e_23) throw e_23.error; }
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
    DeepState.prototype.getUpdateValues = function (oldValue, split, fn, parent) {
        var newValue = fn;
        if (typeof fn === "function") {
            newValue = fn(oldValue);
        }
        if (this.options.useProxy) {
            if (isObject(newValue) || Array.isArray(newValue))
                newValue = this.makeObservable(newValue, split.join(this.options.delimiter), parent);
        }
        return { newValue: newValue, oldValue: oldValue };
    };
    DeepState.prototype.wildcardNotify = function (groupedListenersPack) {
        var e_24, _a;
        var queue = [];
        try {
            for (var groupedListenersPack_1 = __values(groupedListenersPack), groupedListenersPack_1_1 = groupedListenersPack_1.next(); !groupedListenersPack_1_1.done; groupedListenersPack_1_1 = groupedListenersPack_1.next()) {
                var groupedListeners = groupedListenersPack_1_1.value;
                this.getQueueNotifyListeners(groupedListeners, queue);
            }
        }
        catch (e_24_1) { e_24 = { error: e_24_1 }; }
        finally {
            try {
                if (groupedListenersPack_1_1 && !groupedListenersPack_1_1.done && (_a = groupedListenersPack_1["return"])) _a.call(groupedListenersPack_1);
            }
            finally { if (e_24) throw e_24.error; }
        }
        return queue;
    };
    DeepState.prototype.wildcardUpdate = function (updatePath, fn, options, multi) {
        if (options === void 0) { options = defaultUpdateOptions; }
        if (multi === void 0) { multi = false; }
        options = __assign(__assign({}, defaultUpdateOptions), options);
        var scanned = this.scan.get(updatePath);
        var updated = {};
        for (var path in scanned) {
            var split = this.split(path);
            var parent_1 = this.getParent(split, scanned[path]);
            this.addSaving(split, scanned[path]);
            var _a = this.getUpdateValues(scanned[path], split, fn, parent_1), oldValue = _a.oldValue, newValue = _a.newValue;
            if (!this.same(newValue, oldValue) || options.force) {
                this.pathSet(split, newValue);
                updated[path] = newValue;
            }
        }
        var groupedListenersPack = [];
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
        }
        if (multi) {
            var self_1 = this;
            return function () {
                var queue = self_1.wildcardNotify(groupedListenersPack);
                self_1.sortAndRunQueue(queue, updatePath);
                for (var path in scanned) {
                    self_1.removeSaving(self_1.split(path), scanned[path]);
                }
            };
        }
        var queue = this.wildcardNotify(groupedListenersPack);
        this.sortAndRunQueue(queue, updatePath);
        for (var path in scanned) {
            this.removeSaving(this.split(path), scanned[path]);
        }
    };
    DeepState.prototype.updateNotify = function (updatePath, newValue, options) {
        var queue = this.notifySubscribedListeners(updatePath, newValue, options);
        if (this.canBeNested(newValue)) {
            this.notifyNestedListeners(updatePath, newValue, options, "update", queue);
        }
        this.sortAndRunQueue(queue, updatePath);
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
    };
    DeepState.prototype.update = function (updatePath, fnOrValue, options, multi) {
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
        if (this.isWildcard(updatePath)) {
            return this.wildcardUpdate(updatePath, fnOrValue, options, multi);
        }
        var split = this.split(updatePath);
        var currentValue = this.pathGet(updatePath);
        var currentlySaving = this.isSaving(split, currentValue);
        this.addSaving(split, currentValue);
        var parent = this.getParent(split, currentValue);
        var _a = this.getUpdateValues(currentValue, split, fnOrValue, parent), oldValue = _a.oldValue, newValue = _a.newValue;
        if (options.debug) {
            this.options.log("Updating " + updatePath + " " + (options.source ? "from " + options.source : ""), {
                oldValue: oldValue,
                newValue: newValue
            });
        }
        if (this.same(newValue, oldValue) && !options.force) {
            if (multi)
                return function () {
                    return newValue;
                };
            return newValue;
        }
        this.pathSet(split, newValue);
        // if we are saving a parent node - do not notify about changes
        // because someone may modify object which is given as argument
        // and will fire subscriptions immediately which is not intended
        if (this.options.useProxy && currentlySaving && !options.force) {
            this.removeSaving(split, newValue);
            return newValue;
        }
        options = __assign(__assign({}, defaultUpdateOptions), options);
        if (options.only === null) {
            if (multi)
                return function () { };
            this.removeSaving(split, newValue);
            return newValue;
        }
        if (options.only.length) {
            if (multi) {
                var self_2 = this;
                return function () {
                    var result = self_2.updateNotifyOnly(updatePath, newValue, options);
                    self_2.removeSaving(split, newValue);
                    return result;
                };
            }
            this.updateNotifyOnly(updatePath, newValue, options);
            this.removeSaving(split, newValue);
            return newValue;
        }
        if (multi) {
            var self_3 = this;
            return function multiUpdate() {
                var result = self_3.updateNotify(updatePath, newValue, options);
                self_3.removeSaving(split, newValue);
                return result;
            };
        }
        this.updateNotify(updatePath, newValue, options);
        this.removeSaving(split, newValue);
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
                    var currentValue = self.pathGet(updatePath);
                    self.addSaving(split, currentValue);
                    if (typeof value === "function") {
                        value = value(currentValue);
                    }
                    if (self.options.useProxy) {
                        if (isObject(value) || Array.isArray(value)) {
                            var parent_2 = self.getParent(split, currentValue);
                            value = self.makeObservable(value, updatePath, parent_2);
                        }
                    }
                    self.pathSet(split, value);
                    self.removeSaving(split, currentValue);
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
        if (this.destroyed)
            return;
        if (typeof userPath === "undefined" || userPath === "") {
            return this.data;
        }
        return this.pathGet(userPath);
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
