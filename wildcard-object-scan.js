"use strict";
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
exports.__esModule = true;
var stringMatcher_1 = require("./stringMatcher");
var WildcardObject = /** @class */ (function () {
    function WildcardObject(obj, delimiter, wildcard, objectMap, is_match) {
        if (objectMap === void 0) { objectMap = null; }
        if (is_match === void 0) { is_match = undefined; }
        this.objectMap = null;
        this.obj = obj;
        this.delimiter = delimiter;
        this.wildcard = wildcard;
        this.is_match = is_match;
        this.objectMap = objectMap;
    }
    WildcardObject.prototype.shortMatch = function (first, second) {
        if (first === second)
            return true;
        if (first === this.wildcard)
            return true;
        if (this.is_match)
            return this.is_match(first, second);
        var index = first.indexOf(this.wildcard);
        if (index > -1) {
            var end = first.substr(index + 1);
            if (index === 0 || second.substring(0, index) === first.substring(0, index)) {
                var len = end.length;
                if (len > 0) {
                    return second.substr(-len) === end;
                }
                return true;
            }
        }
        return false;
    };
    WildcardObject.prototype.match = function (first, second) {
        if (this.is_match)
            return this.is_match(first, second);
        return (first === second ||
            first === this.wildcard ||
            second === this.wildcard ||
            this.shortMatch(first, second) ||
            (0, stringMatcher_1.Match)(first, second, this.wildcard));
    };
    WildcardObject.prototype.handleArray = function (wildcard, currentArr, partIndex, path, result) {
        var e_1, _a;
        if (result === void 0) { result = {}; }
        var nextPartIndex = wildcard.indexOf(this.delimiter, partIndex);
        var end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcard.length;
        }
        var currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
        var index = 0;
        try {
            for (var currentArr_1 = __values(currentArr), currentArr_1_1 = currentArr_1.next(); !currentArr_1_1.done; currentArr_1_1 = currentArr_1.next()) {
                var item = currentArr_1_1.value;
                var key = index.toString();
                var currentPath = path === "" ? key : path + this.delimiter + index;
                if (currentWildcardPath === this.wildcard ||
                    currentWildcardPath === key ||
                    this.shortMatch(currentWildcardPath, key)) {
                    end ? (result[currentPath] = item) : this.goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
                }
                index++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (currentArr_1_1 && !currentArr_1_1.done && (_a = currentArr_1["return"])) _a.call(currentArr_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    WildcardObject.prototype.handleObject = function (wildcardPath, currentObj, partIndex, path, result) {
        if (result === void 0) { result = {}; }
        var nextPartIndex = wildcardPath.indexOf(this.delimiter, partIndex);
        var end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcardPath.length;
        }
        var currentWildcardPath = wildcardPath.substring(partIndex, nextPartIndex);
        for (var key in currentObj) {
            key = key.toString();
            var currentPath = path === "" ? key : path + this.delimiter + key;
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
    };
    WildcardObject.prototype.goFurther = function (path, currentObj, partIndex, currentPath, result) {
        if (result === void 0) { result = {}; }
        if (Array.isArray(currentObj)) {
            return this.handleArray(path, currentObj, partIndex, currentPath, result);
        }
        return this.handleObject(path, currentObj, partIndex, currentPath, result);
    };
    WildcardObject.prototype.getIndicesCount = function (searchStr, str) {
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
    WildcardObject.prototype.getFromMap = function (path) {
        var e_2, _a;
        var result = {};
        var pathDelimitersCount = this.getIndicesCount(this.delimiter, path);
        var len = path.length;
        try {
            for (var _b = __values(this.objectMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (this.getIndicesCount(this.delimiter, key) === pathDelimitersCount && this.match(path, key)) {
                    result[key] = value;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return result;
    };
    WildcardObject.prototype.get = function (path) {
        if (this.objectMap) {
            return this.getFromMap(path);
        }
        return this.goFurther(path, this.obj, 0, "");
    };
    return WildcardObject;
}());
exports["default"] = WildcardObject;
