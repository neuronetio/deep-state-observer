"use strict";
exports.__esModule = true;
var ObjectPath = /** @class */ (function () {
    function ObjectPath() {
    }
    ObjectPath.get = function (path, obj, copiedPath) {
        if (copiedPath === void 0) { copiedPath = null; }
        if (copiedPath === null) {
            copiedPath = path.slice();
        }
        if (copiedPath.length === 0 || typeof obj === "undefined") {
            return obj;
        }
        var currentPath = copiedPath.shift();
        if (!obj.hasOwnProperty(currentPath)) {
            return undefined;
        }
        if (copiedPath.length === 0) {
            return obj[currentPath];
        }
        return ObjectPath.get(path, obj[currentPath], copiedPath);
    };
    ObjectPath.set = function (path, newValue, obj, copiedPath) {
        if (copiedPath === void 0) { copiedPath = null; }
        if (copiedPath === null) {
            copiedPath = path.slice();
        }
        if (copiedPath.length === 0) {
            for (var key in obj) {
                delete obj[key];
            }
            for (var key in newValue) {
                obj[key] = newValue[key];
            }
            return;
        }
        var currentPath = copiedPath.shift();
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
    };
    return ObjectPath;
}());
exports["default"] = ObjectPath;
