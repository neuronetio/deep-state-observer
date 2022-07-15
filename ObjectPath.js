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
exports.__esModule = true;
var ObjectPath = /** @class */ (function () {
    function ObjectPath() {
    }
    ObjectPath.get = function (path, obj, create) {
        var e_1, _a;
        if (create === void 0) { create = false; }
        if (!obj)
            return;
        var currObj = obj;
        try {
            for (var path_1 = __values(path), path_1_1 = path_1.next(); !path_1_1.done; path_1_1 = path_1.next()) {
                var currentPath = path_1_1.value;
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (path_1_1 && !path_1_1.done && (_a = path_1["return"])) _a.call(path_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return currObj;
    };
    ObjectPath.set = function (path, value, obj) {
        if (!obj)
            return;
        if (path.length === 0) {
            for (var key in obj) {
                delete obj[key];
            }
            for (var key in value) {
                obj[key] = value[key];
            }
            return;
        }
        var prePath = path.slice();
        var lastPath = prePath.pop();
        var get = ObjectPath.get(prePath, obj, true);
        if (typeof get === "object") {
            get[lastPath] = value;
        }
        return value;
    };
    return ObjectPath;
}());
exports["default"] = ObjectPath;
