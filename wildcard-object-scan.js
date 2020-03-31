"use strict";
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
exports.__esModule = true;
var stringMatcher_1 = require("./stringMatcher");
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
WildcardObject.prototype.match = function match(first, second) {
    return (first === second ||
        first === this.wildcard ||
        second === this.wildcard ||
        this.simpleMatch(first, second) ||
        new stringMatcher_1["default"](first).match(second));
};
WildcardObject.prototype.handleArray = function handleArray(wildcard, currentArr, partIndex, path, result) {
    var e_1, _a;
    if (result === void 0) { result = {}; }
    var nextPartIndex = wildcard.indexOf(this.delimeter, partIndex);
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
            var currentPath = path === '' ? key : path + this.delimeter + index;
            if (currentWildcardPath === this.wildcard ||
                currentWildcardPath === key ||
                this.simpleMatch(currentWildcardPath, key)) {
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
WildcardObject.prototype.handleObject = function handleObject(wildcard, currentObj, partIndex, path, result) {
    if (result === void 0) { result = {}; }
    var nextPartIndex = wildcard.indexOf(this.delimeter, partIndex);
    var end = false;
    if (nextPartIndex === -1) {
        end = true;
        nextPartIndex = wildcard.length;
    }
    var currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
    for (var key in currentObj) {
        key = key.toString();
        var currentPath = path === '' ? key : path + this.delimeter + key;
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
WildcardObject.prototype.goFurther = function goFurther(wildcard, currentObj, partIndex, currentPath, result) {
    if (result === void 0) { result = {}; }
    if (Array.isArray(currentObj)) {
        return this.handleArray(wildcard, currentObj, partIndex, currentPath, result);
    }
    return this.handleObject(wildcard, currentObj, partIndex, currentPath, result);
};
WildcardObject.prototype.get = function get(wildcard) {
    return this.goFurther(wildcard, this.obj, 0, '');
};
exports["default"] = WildcardObject;
