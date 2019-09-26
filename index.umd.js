(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global['svelte-deep-store'] = {}));
}(this, function (exports) { 'use strict';

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var compareCommon = createCommonjsModule(function (module, exports) {
    var _a, _b, _c;
    Object.defineProperty(exports, "__esModule", { value: true });
    var CompareResult;
    (function (CompareResult) {
        CompareResult[CompareResult["Disjoint"] = 0] = "Disjoint";
        CompareResult[CompareResult["Intersect"] = 1] = "Intersect";
        CompareResult[CompareResult["Subset"] = 2] = "Subset";
        CompareResult[CompareResult["Identity"] = 3] = "Identity";
        CompareResult[CompareResult["Superset"] = 4] = "Superset";
    })(CompareResult = exports.CompareResult || (exports.CompareResult = {}));
    var Disjoint = CompareResult.Disjoint, Intersect = CompareResult.Intersect, Subset = CompareResult.Subset, Identity = CompareResult.Identity, Superset = CompareResult.Superset;
    exports.OrToNotOr = (_a = {},
        _a[Disjoint] = Subset,
        _a[Intersect] = Intersect,
        _a[Subset] = Disjoint,
        _a[Identity] = Disjoint,
        _a[Superset] = Intersect,
        _a);
    exports.NotOrToOr = (_b = {},
        _b[Disjoint] = Superset,
        _b[Intersect] = Intersect,
        _b[Subset] = Intersect,
        _b[Identity] = Disjoint,
        _b[Superset] = Disjoint,
        _b);
    exports.NotOrToNotOr = (_c = {},
        _c[Disjoint] = Intersect,
        _c[Intersect] = Intersect,
        _c[Subset] = Superset,
        _c[Identity] = Identity,
        _c[Superset] = Subset,
        _c);

    });

    unwrapExports(compareCommon);
    var compareCommon_1 = compareCommon.CompareResult;
    var compareCommon_2 = compareCommon.OrToNotOr;
    var compareCommon_3 = compareCommon.NotOrToOr;
    var compareCommon_4 = compareCommon.NotOrToNotOr;

    var compilePathWithParams = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startsWith = function (str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
    };
    exports.endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    var getter = function (v) { return function () { return v; }; };
    var createParamBuilder = function (parts, varIndexes, separator, nilParam) { return function (params) {
        var fillParts = parts.slice();
        for (var i = 0, len = varIndexes.length; i < len; i += 1) {
            var index = varIndexes[i];
            var name_1 = parts[index];
            var val = params[name_1];
            fillParts[index] = val == null ? nilParam : val;
        }
        return fillParts.join(separator);
    }; };
    exports.compilePathWithParams = function (path, options) {
        var paramPrefix = (options && options.paramPrefix) || '$';
        var paramSuffix = (options && options.paramSuffix) || '';
        var separator = (options && options.separator) || '/';
        var nilParam = (options && options.nilParam) || '*';
        var parts = path.split(separator);
        var varIndexes = [];
        var optimizedParts = [];
        var toCombine = [];
        for (var i = 0, len = parts.length; i < len; i += 1) {
            var part = parts[i];
            if (exports.startsWith(part, paramPrefix) && exports.endsWith(part, paramSuffix)) {
                if (toCombine.length) {
                    optimizedParts.push(toCombine.join(separator));
                    toCombine = [];
                }
                optimizedParts.push(part.substring(paramPrefix.length, part.length - paramSuffix.length));
                varIndexes.push(optimizedParts.length - 1);
            }
            else {
                toCombine.push(part);
            }
        }
        if (toCombine.length) {
            optimizedParts.push(toCombine.join(separator));
            toCombine = null;
        }
        if (!varIndexes.length) {
            return getter(path);
        }
        return createParamBuilder(optimizedParts, varIndexes, separator, nilParam);
    };

    });

    unwrapExports(compilePathWithParams);
    var compilePathWithParams_1 = compilePathWithParams.startsWith;
    var compilePathWithParams_2 = compilePathWithParams.endsWith;
    var compilePathWithParams_3 = compilePathWithParams.compilePathWithParams;

    var stringMatcher = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var getIsEqual = function (x) { return function (y) { return x === y; }; };
    var returnTrue = function () { return true; };
    exports.getWildcardStringMatcher = function (pattern) {
        if (pattern === '*') {
            return returnTrue;
        }
        var segments = [];
        var starCount = 0;
        var minLength = 0;
        var maxLength = 0;
        var segStartIndex = 0;
        for (var i = 0, len = pattern.length; i < len; i += 1) {
            var char = pattern[i];
            if (char === '*' || char === '?') {
                if (char === '*') {
                    starCount += 1;
                }
                if (i > segStartIndex) {
                    segments.push(pattern.substring(segStartIndex, i));
                }
                segments.push(char);
                segStartIndex = i + 1;
            }
        }
        if (!segments.length) {
            return getIsEqual(pattern);
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
        return function (match) {
            var length = match.length;
            if (length < minLength || length > maxLength) {
                return false;
            }
            var lookLeft = true;
            var segLeftIndex = 0;
            var segRightIndex = segments.length - 1;
            var leftPos = 0;
            var rightPos = match.length - 1;
            var leftIsStar = false;
            var rightIsStar = false;
            while (true) {
                if (lookLeft) {
                    var segment = segments[segLeftIndex];
                    segLeftIndex += 1;
                    if (segment === '*') {
                        leftIsStar = true;
                        if (rightIsStar) ;
                        else {
                            lookLeft = false;
                        }
                    }
                    else if (segment === '?') {
                        if (leftPos > rightPos) {
                            return false;
                        }
                        if (match[leftPos] === '*') {
                            return false;
                        }
                        leftPos += 1;
                    }
                    else {
                        var index = match.indexOf(segment, leftPos);
                        if (index === -1 || index > rightPos + 1 - segment.length) {
                            return false;
                        }
                        if (leftIsStar) {
                            leftPos = index + segment.length;
                            leftIsStar = false;
                        }
                        else {
                            if (index !== leftPos) {
                                return false;
                            }
                            leftPos += segment.length;
                        }
                    }
                }
                else {
                    var segment = segments[segRightIndex];
                    segRightIndex -= 1;
                    if (segment === '*') {
                        rightIsStar = true;
                        if (leftIsStar) ;
                        else {
                            lookLeft = true;
                        }
                    }
                    else if (segment === '?') {
                        if (leftPos > rightPos) {
                            return false;
                        }
                        if (match[rightPos] === '*') {
                            return false;
                        }
                        rightPos -= 1;
                    }
                    else {
                        var lastIndex = rightPos + 1 - segment.length;
                        var index = match.lastIndexOf(segment, lastIndex);
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
                }
                if (segLeftIndex > segRightIndex) {
                    break;
                }
            }
            return true;
        };
    };

    });

    unwrapExports(stringMatcher);
    var stringMatcher_1 = stringMatcher.getWildcardStringMatcher;

    var _const = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Not = '!';
    exports.WildKey = '*';
    exports.MatchAny = 1;
    exports.MatchNone = -1;
    var ObjectPropType;
    (function (ObjectPropType) {
        ObjectPropType[ObjectPropType["Match"] = 1] = "Match";
        ObjectPropType[ObjectPropType["NoMatch"] = -1] = "NoMatch";
        ObjectPropType[ObjectPropType["Value"] = 2] = "Value";
        ObjectPropType[ObjectPropType["Or"] = 3] = "Or";
        ObjectPropType[ObjectPropType["NotOr"] = 4] = "NotOr";
    })(ObjectPropType = exports.ObjectPropType || (exports.ObjectPropType = {}));

    });

    unwrapExports(_const);
    var _const_1 = _const.Not;
    var _const_2 = _const.WildKey;
    var _const_3 = _const.MatchAny;
    var _const_4 = _const.MatchNone;
    var _const_5 = _const.ObjectPropType;

    var common = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var isArray = Array.isArray;
    exports.isNotOrExp = function (prop) { return prop[0] === _const.Not && isArray(prop[1]); };

    });

    unwrapExports(common);
    var common_1 = common.isNotOrExp;

    var compareKeySet = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var Disjoint = compareCommon.CompareResult.Disjoint, Intersect = compareCommon.CompareResult.Intersect, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    var keys = Object.keys;
    exports.compareKeySet = function (a, b, aKeys, bKeys) {
        if (aKeys === void 0) { aKeys = keys(a); }
        if (bKeys === void 0) { bKeys = keys(b); }
        var aLen = aKeys.length;
        var bLen = bKeys.length;
        var intersects = false;
        var aOnly = false;
        var bOnly = false;
        if (aLen <= bLen) {
            for (var i = 0; i < aLen; i += 1) {
                if (b[aKeys[i]] === 1) {
                    intersects = true;
                }
                else {
                    aOnly = true;
                }
            }
            if (!intersects) {
                return Disjoint;
            }
            for (var i = 0; i < bLen; i += 1) {
                if (a[bKeys[i]] !== 1) {
                    bOnly = true;
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < bLen; i += 1) {
                if (a[bKeys[i]] === 1) {
                    intersects = true;
                }
                else {
                    bOnly = true;
                }
            }
            if (!intersects) {
                return Disjoint;
            }
            for (var i = 0; i < aLen; i += 1) {
                if (b[aKeys[i]] !== 1) {
                    aOnly = true;
                    break;
                }
            }
        }
        if (aOnly) {
            if (bOnly) {
                return Intersect;
            }
            return Superset;
        }
        if (bOnly) {
            return Subset;
        }
        return Identity;
    };

    });

    unwrapExports(compareKeySet);
    var compareKeySet_1 = compareKeySet.compareKeySet;

    var compareArray = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.compareArray = function (a, b) {
        var aMap = {};
        for (var i = 0, aLen = a.length; i < aLen; i += 1) {
            aMap[a[i]] = 1;
        }
        var bMap = {};
        for (var i = 0, bLen = b.length; i < bLen; i += 1) {
            bMap[b[i]] = 1;
        }
        return compareKeySet.compareKeySet(aMap, bMap, a, b);
    };

    });

    unwrapExports(compareArray);
    var compareArray_1 = compareArray.compareArray;

    var compareValueToArray = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var Disjoint = compareCommon.CompareResult.Disjoint, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity;
    exports.compareValueToArray = function (value, enums) {
        var found = false;
        var hasMore = false;
        for (var i = 0, len = enums.length; i < len; i += 1) {
            if (value === enums[i]) {
                if (hasMore) {
                    return Subset;
                }
                found = true;
            }
            else {
                if (found) {
                    return Subset;
                }
                hasMore = true;
            }
        }
        return found ? Identity : Disjoint;
    };

    });

    unwrapExports(compareValueToArray);
    var compareValueToArray_1 = compareValueToArray.compareValueToArray;

    var parseProp = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var Value = _const.ObjectPropType.Value, Or = _const.ObjectPropType.Or, NotOr = _const.ObjectPropType.NotOr;
    var isArray = Array.isArray;
    exports.MatchProp = [_const.ObjectPropType.Match];
    exports.NoMatchProp = [_const.ObjectPropType.NoMatch];
    exports.parseProp = function (prop) {
        if (typeof prop === 'string') {
            return [Value, prop];
        }
        if (prop === _const.MatchAny) {
            return exports.MatchProp;
        }
        if (prop === _const.MatchNone) {
            return exports.NoMatchProp;
        }
        if (prop[0] === _const.Not && isArray(prop[1])) {
            return prop[1].length === 0 ? exports.MatchProp : [NotOr, prop[1]];
        }
        var length = prop.length;
        if (length === 0) {
            return exports.NoMatchProp;
        }
        if (length === 1) {
            return [Value, prop[0]];
        }
        return [Or, prop];
    };

    });

    unwrapExports(parseProp);
    var parseProp_1 = parseProp.MatchProp;
    var parseProp_2 = parseProp.NoMatchProp;
    var parseProp_3 = parseProp.parseProp;

    var compareProp = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });





    var Disjoint = compareCommon.CompareResult.Disjoint, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    var Value = _const.ObjectPropType.Value, Or = _const.ObjectPropType.Or, NotOr = _const.ObjectPropType.NotOr;
    exports.compareProp = function (prop1, prop2) {
        var parsed1 = parseProp.parseProp(prop1);
        if (parsed1 === parseProp.NoMatchProp) {
            return Disjoint;
        }
        var parsed2 = parseProp.parseProp(prop2);
        if (parsed2 === parseProp.NoMatchProp) {
            return Disjoint;
        }
        if (parsed1 === parsed2) {
            return Identity;
        }
        if (parsed1 === parseProp.MatchProp) {
            return Superset;
        }
        if (parsed2 === parseProp.MatchProp) {
            return Subset;
        }
        switch (parsed1[0]) {
            case Value:
                switch (parsed2[0]) {
                    case Value:
                        return parsed1[1] === parsed2[1] ? Identity : Disjoint;
                    case Or:
                        return compareValueToArray.compareValueToArray(parsed1[1], parsed2[1]);
                    case NotOr:
                        return parsed2[1].indexOf(parsed1[1]) === -1 ? Subset : Disjoint;
                }
                break;
            case Or:
                switch (parsed2[0]) {
                    case Value: {
                        var res = compareValueToArray.compareValueToArray(parsed2[1], parsed1[1]);
                        return res === Subset ? Superset : res;
                    }
                    case Or:
                        return compareArray.compareArray(parsed1[1], parsed2[1]);
                    case NotOr:
                        return compareCommon.OrToNotOr[compareArray.compareArray(parsed1[1], parsed2[1])];
                }
                break;
            case NotOr:
                switch (parsed2[0]) {
                    case Value:
                        return parsed1[1].indexOf(parsed2[1]) === -1 ? Superset : Disjoint;
                    case Or:
                        return compareCommon.NotOrToOr[compareArray.compareArray(parsed1[1], parsed2[1])];
                    case NotOr:
                        return compareCommon.NotOrToNotOr[compareArray.compareArray(parsed1[1], parsed2[1])];
                }
                break;
        }
        return Disjoint;
    };

    });

    unwrapExports(compareProp);
    var compareProp_1 = compareProp.compareProp;

    var intersectKeySet = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var keys = Object.keys;
    exports.intersectKeySet = function (a, b, aKeys, bKeys) {
        if (aKeys === void 0) { aKeys = keys(a); }
        if (bKeys === void 0) { bKeys = keys(b); }
        var aLen = aKeys.length;
        var bLen = bKeys.length;
        if (aLen <= bLen) {
            for (var i = 0; i < aLen; i += 1) {
                var aKey = aKeys[i];
                if (b[aKey] === 1) {
                    return true;
                }
            }
        }
        else {
            for (var i = 0; i < bLen; i += 1) {
                var bKey = bKeys[i];
                if (a[bKey] === 1) {
                    return true;
                }
            }
        }
        return false;
    };

    });

    unwrapExports(intersectKeySet);
    var intersectKeySet_1 = intersectKeySet.intersectKeySet;

    var intersectArray = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.intersectArray = function (a, b) {
        var aMap = {};
        for (var i = 0, aLen = a.length; i < aLen; i += 1) {
            aMap[a[i]] = 1;
        }
        var bMap = {};
        for (var i = 0, bLen = b.length; i < bLen; i += 1) {
            bMap[b[i]] = 1;
        }
        return intersectKeySet.intersectKeySet(aMap, bMap, a, b);
    };

    });

    unwrapExports(intersectArray);
    var intersectArray_1 = intersectArray.intersectArray;

    var subsetKeySet = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var keys = Object.keys;
    exports.subsetKeySet = function (a, b, aKeys, bKeys) {
        if (aKeys === void 0) { aKeys = keys(a); }
        if (bKeys === void 0) { bKeys = keys(b); }
        var aLen = aKeys.length;
        var bLen = bKeys.length;
        if (aLen === 0 || bLen === 0) {
            return false;
        }
        for (var i = 0; i < aLen; i += 1) {
            if (b[aKeys[i]] !== 1) {
                return false;
            }
        }
        return true;
    };

    });

    unwrapExports(subsetKeySet);
    var subsetKeySet_1 = subsetKeySet.subsetKeySet;

    var subsetArray = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.subsetArray = function (a, b) {
        var aMap = {};
        for (var i = 0, aLen = a.length; i < aLen; i += 1) {
            aMap[a[i]] = 1;
        }
        var bMap = {};
        for (var i = 0, bLen = b.length; i < bLen; i += 1) {
            bMap[b[i]] = 1;
        }
        return subsetKeySet.subsetKeySet(aMap, bMap, a, b);
    };

    });

    unwrapExports(subsetArray);
    var subsetArray_1 = subsetArray.subsetArray;

    var intersectProp = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });




    var Value = _const.ObjectPropType.Value, Or = _const.ObjectPropType.Or, NotOr = _const.ObjectPropType.NotOr;
    exports.intersectProp = function (prop1, prop2) {
        var parsed1 = parseProp.parseProp(prop1);
        if (parsed1 === parseProp.NoMatchProp) {
            return false;
        }
        var parsed2 = parseProp.parseProp(prop2);
        if (parsed2 === parseProp.NoMatchProp) {
            return false;
        }
        if (parsed1 === parsed2 || parsed1 === parseProp.MatchProp || parsed2 === parseProp.MatchProp) {
            return true;
        }
        switch (parsed1[0]) {
            case Value:
                switch (parsed2[0]) {
                    case Value:
                        return parsed1[1] === parsed2[1];
                    case Or:
                        return parsed2[1].indexOf(parsed1[1]) !== -1;
                    case NotOr:
                        return parsed2[1].indexOf(parsed1[1]) === -1;
                }
                break;
            case Or:
                switch (parsed2[0]) {
                    case Value:
                        return parsed1[1].indexOf(parsed2[1]) !== -1;
                    case Or:
                        return intersectArray.intersectArray(parsed1[1], parsed2[1]);
                    case NotOr:
                        return !subsetArray.subsetArray(parsed1[1], parsed2[1]);
                }
                break;
            case NotOr:
                switch (parsed2[0]) {
                    case Value:
                        return parsed1[1].indexOf(parsed2[1]) === -1;
                    case Or:
                        return !subsetArray.subsetArray(parsed2[1], parsed1[1]);
                    case NotOr:
                        return true;
                }
                break;
        }
        return false;
    };

    });

    unwrapExports(intersectProp);
    var intersectProp_1 = intersectProp.intersectProp;

    var matchObject = createCommonjsModule(function (module, exports) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    Object.defineProperty(exports, "__esModule", { value: true });




    var getKeys = Object.keys;
    var Disjoint = compareCommon.CompareResult.Disjoint, Intersect = compareCommon.CompareResult.Intersect, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    var ruleMap = (_a = {},
        _a[Disjoint] = (_b = {}, _b[Disjoint] = 1, _b),
        _a.disjoint = (_c = {}, _c[Disjoint] = 1, _c),
        _a[Intersect] = (_d = {}, _d[Intersect] = 1, _d[Subset] = 1, _d[Identity] = 1, _d[Superset] = 1, _d),
        _a.intersect = (_e = {}, _e[Intersect] = 1, _e[Subset] = 1, _e[Identity] = 1, _e[Superset] = 1, _e),
        _a[Subset] = (_f = {}, _f[Subset] = 1, _f[Identity] = 1, _f),
        _a.subset = (_g = {}, _g[Subset] = 1, _g[Identity] = 1, _g),
        _a[Identity] = (_h = {}, _h[Identity] = 1, _h),
        _a.identity = (_j = {}, _j[Identity] = 1, _j),
        _a[Superset] = (_k = {}, _k[Identity] = 1, _k[Superset] = 1, _k),
        _a.superset = (_l = {}, _l[Identity] = 1, _l[Superset] = 1, _l),
        _a);
    exports.matchObject = function (obj1, obj2, rules) {
        var keys1 = getKeys(obj1);
        for (var i = 0, len = keys1.length; i < len; i += 1) {
            var key = keys1[i];
            if (key !== _const.WildKey) {
                var v2 = obj2[key];
                if (v2 == null) {
                    v2 = obj2[_const.WildKey];
                    if (v2 == null) {
                        v2 = _const.MatchNone;
                    }
                }
                var rule = rules[key];
                if (rule == null) {
                    rule = rules[_const.WildKey];
                    if (rule == null) {
                        rule = Intersect;
                    }
                }
                if (rule === Intersect) {
                    if (!intersectProp.intersectProp(obj1[key], v2)) {
                        return key;
                    }
                }
                else {
                    var res = compareProp.compareProp(obj1[key], v2);
                    if (ruleMap[rule][res] !== 1) {
                        return key;
                    }
                }
            }
        }
        var keys2 = getKeys(obj2);
        for (var i = 0, len = keys2.length; i < len; i += 1) {
            var key = keys2[i];
            if (key !== _const.WildKey && !(key in obj1)) {
                var v1 = obj1[_const.WildKey];
                if (v1 == null) {
                    v1 = _const.MatchNone;
                }
                var rule = rules[key];
                if (rule == null) {
                    rule = rules[_const.WildKey];
                    if (rule == null) {
                        rule = Intersect;
                    }
                }
                if (rule === Intersect) {
                    if (!intersectProp.intersectProp(v1, obj2[key])) {
                        return key;
                    }
                }
                else {
                    var res = compareProp.compareProp(v1, obj2[key]);
                    if (ruleMap[rule][res] !== 1) {
                        return key;
                    }
                }
            }
        }
        return null;
    };

    });

    unwrapExports(matchObject);
    var matchObject_1 = matchObject.matchObject;

    var _const$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.w1 = '*';
    exports.w0p = '**';
    exports.w01 = '*?';
    exports.EmptySet = '()';
    var SegmentType;
    (function (SegmentType) {
        SegmentType[SegmentType["Nil"] = 0] = "Nil";
        SegmentType[SegmentType["Value"] = 1] = "Value";
        SegmentType[SegmentType["Wild"] = 2] = "Wild";
        SegmentType[SegmentType["Or"] = 3] = "Or";
        SegmentType[SegmentType["NotOr"] = 4] = "NotOr";
    })(SegmentType = exports.SegmentType || (exports.SegmentType = {}));

    });

    unwrapExports(_const$1);
    var _const_1$1 = _const$1.w1;
    var _const_2$1 = _const$1.w0p;
    var _const_3$1 = _const$1.w01;
    var _const_4$1 = _const$1.EmptySet;
    var _const_5$1 = _const$1.SegmentType;

    var compareParsedSegment = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });



    var Disjoint = compareCommon.CompareResult.Disjoint, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    var Value = _const$1.SegmentType.Value, Wild = _const$1.SegmentType.Wild, Nil = _const$1.SegmentType.Nil, Or = _const$1.SegmentType.Or, NotOr = _const$1.SegmentType.NotOr;
    exports.compareParsedSegment = function (a, b) {
        if (a === b || a.pattern === b.pattern) {
            return a.type === Nil ? Disjoint : Identity;
        }
        switch (a.type) {
            case Value:
                switch (b.type) {
                    case Value:
                        return Disjoint;
                    case Wild:
                        return Subset;
                    case Nil:
                        return Disjoint;
                    case Or:
                        return compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums);
                    case NotOr:
                        return compareCommon.OrToNotOr[compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums)];
                }
                break;
            case Wild:
                switch (b.type) {
                    case Value:
                        return Superset;
                    case Wild:
                        return a.compareLength(b);
                    case Nil:
                        return Disjoint;
                    case Or:
                        return Superset;
                    case NotOr:
                        return Superset;
                }
                break;
            case Nil:
                return Disjoint;
            case Or:
                switch (b.type) {
                    case Value:
                        return compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums);
                    case Wild:
                        return Subset;
                    case Nil:
                        return Disjoint;
                    case Or:
                        return compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums);
                    case NotOr:
                        return compareCommon.OrToNotOr[compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums)];
                }
                break;
            case NotOr:
                switch (b.type) {
                    case Value:
                        return compareCommon.NotOrToOr[compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums)];
                    case Wild:
                        return Subset;
                    case Nil:
                        return Disjoint;
                    case Or:
                        return compareCommon.NotOrToOr[compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums)];
                    case NotOr:
                        return compareCommon.NotOrToNotOr[compareKeySet.compareKeySet(a.enumMap, b.enumMap, a.enums, b.enums)];
                }
                break;
        }
        return Disjoint;
    };

    });

    unwrapExports(compareParsedSegment);
    var compareParsedSegment_1 = compareParsedSegment.compareParsedSegment;

    var compareRange = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    var Disjoint = compareCommon.CompareResult.Disjoint, Intersect = compareCommon.CompareResult.Intersect, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    exports.compareRange = function (min1, max1, min2, max2) {
        if (min1 === min2 && max1 === max2) {
            return Identity;
        }
        if (min1 <= min2 && max1 >= max2) {
            return Superset;
        }
        if (min1 >= min2 && max1 <= max2) {
            return Subset;
        }
        if (max1 < min2 || max2 < min1) {
            return Disjoint;
        }
        return Intersect;
    };

    });

    unwrapExports(compareRange);
    var compareRange_1 = compareRange.compareRange;

    var compareSegmentsMatcher = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });




    var Disjoint = compareCommon.CompareResult.Disjoint, Intersect = compareCommon.CompareResult.Intersect, Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    var reduceCompareResult = function (prev, next) {
        if (prev === next || prev === Identity) {
            return next;
        }
        if (next === Identity) {
            return prev;
        }
        return Intersect;
    };
    exports.compareSegmentsMatcher = function (matcher1, matcher2) {
        if (matcher1 === matcher2 || matcher1.pattern === matcher2.pattern) {
            return matcher1.pattern === _const$1.EmptySet ? Disjoint : Identity;
        }
        var _a = matcher1.length, min1 = _a[0], max1 = _a[1];
        var _b = matcher2.length, min2 = _b[0], max2 = _b[1];
        var res = compareRange.compareRange(min1, max1, min2, max2);
        if (res === Disjoint || matcher1._hasNilSegment || matcher2._hasNilSegment) {
            return Disjoint;
        }
        var segments1 = matcher1._segments;
        var segments2 = matcher2._segments;
        var segLen1 = segments1.length;
        var segLen2 = segments2.length;
        var varLengthIndex1 = matcher1._varLengthIndex;
        var varLengthIndex2 = matcher2._varLengthIndex;
        var fixedLength1 = varLengthIndex1 === -1;
        var fixedLength2 = varLengthIndex2 === -1;
        var leftLength1 = fixedLength1 ? segLen1 : varLengthIndex1;
        var leftLength2 = fixedLength2 ? segLen2 : varLengthIndex2;
        var leftLength = Math.min(leftLength1, leftLength2);
        for (var i = 0; i < leftLength; i += 1) {
            var segRes = compareParsedSegment.compareParsedSegment(segments1[i], segments2[i]);
            if (segRes === Disjoint) {
                return Disjoint;
            }
            res = reduceCompareResult(res, segRes);
        }
        if (leftLength1 !== leftLength2) {
            res = reduceCompareResult(res, leftLength1 > leftLength2 ? Subset : Superset);
        }
        if (fixedLength1 && fixedLength2) {
            return res;
        }
        var lastIndex1 = segLen1 - 1;
        var lastIndex2 = segLen2 - 1;
        var rightLength1 = fixedLength1 ? segLen1 : lastIndex1 - varLengthIndex1;
        var rightLength2 = fixedLength2 ? segLen2 : lastIndex2 - varLengthIndex2;
        var rightLength = Math.min(rightLength1, rightLength2);
        for (var i = 0; i < rightLength; i += 1) {
            var segRes = compareParsedSegment.compareParsedSegment(segments1[lastIndex1 - i], segments2[lastIndex2 - i]);
            if (segRes === Disjoint) {
                return Disjoint;
            }
            res = reduceCompareResult(res, segRes);
        }
        if (rightLength1 !== rightLength2) {
            res = reduceCompareResult(res, rightLength1 > rightLength2 ? Subset : Superset);
        }
        return res;
    };

    });

    unwrapExports(compareSegmentsMatcher);
    var compareSegmentsMatcher_1 = compareSegmentsMatcher.compareSegmentsMatcher;

    var intersectParsedSegment = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });



    var Value = _const$1.SegmentType.Value, Wild = _const$1.SegmentType.Wild, Nil = _const$1.SegmentType.Nil, Or = _const$1.SegmentType.Or, NotOr = _const$1.SegmentType.NotOr;
    exports.intersectParsedSegment = function (a, b) {
        if (a === b || a.pattern === b.pattern) {
            return a.type !== Nil;
        }
        switch (a.type) {
            case Value:
                switch (b.type) {
                    case Value:
                        return false;
                    case Wild:
                        return true;
                    case Nil:
                        return false;
                    case Or:
                        return b.enumMap[a.pattern] === 1;
                    case NotOr:
                        return b.enumMap[a.pattern] !== 1;
                }
                break;
            case Wild:
                return b.type !== Nil;
            case Nil:
                return false;
            case Or:
                switch (b.type) {
                    case Value:
                        return a.enumMap[b.pattern] === 1;
                    case Wild:
                        return true;
                    case Nil:
                        return false;
                    case Or:
                        return intersectKeySet.intersectKeySet(a.enumMap, b.enumMap, a.enums, b.enums);
                    case NotOr:
                        return !subsetKeySet.subsetKeySet(a.enumMap, b.enumMap, a.enums, b.enums);
                }
                break;
            case NotOr:
                switch (b.type) {
                    case Value:
                        return a.enumMap[b.pattern] !== 1;
                    case Wild:
                        return true;
                    case Nil:
                        return false;
                    case Or:
                        return !subsetKeySet.subsetKeySet(b.enumMap, a.enumMap, b.enums, a.enums);
                    case NotOr:
                        return true;
                }
                break;
        }
        return false;
    };

    });

    unwrapExports(intersectParsedSegment);
    var intersectParsedSegment_1 = intersectParsedSegment.intersectParsedSegment;

    var intersectSegmentsMatcher = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    exports.intersectSegmentsMatcher = function (matcher1, matcher2) {
        if (matcher1 === matcher2 || matcher1.pattern === matcher2.pattern) {
            return matcher1.pattern !== _const$1.EmptySet;
        }
        var _a = matcher1.length, min1 = _a[0], max1 = _a[1];
        var _b = matcher2.length, min2 = _b[0], max2 = _b[1];
        if (max1 < min2 ||
            max2 < min1 ||
            matcher1._hasNilSegment ||
            matcher2._hasNilSegment) {
            return false;
        }
        var segments1 = matcher1._segments;
        var segments2 = matcher2._segments;
        var segLen1 = segments1.length;
        var segLen2 = segments2.length;
        var varLengthIndex1 = matcher1._varLengthIndex;
        var varLengthIndex2 = matcher2._varLengthIndex;
        var fixedLength1 = varLengthIndex1 === -1;
        var fixedLength2 = varLengthIndex2 === -1;
        var leftLength1 = fixedLength1 ? segLen1 : varLengthIndex1;
        var leftLength2 = fixedLength2 ? segLen2 : varLengthIndex2;
        var leftLength = Math.min(leftLength1, leftLength2);
        for (var i = 0; i < leftLength; i += 1) {
            if (!intersectParsedSegment.intersectParsedSegment(segments1[i], segments2[i])) {
                return false;
            }
        }
        if (fixedLength1 && fixedLength2) {
            return true;
        }
        var lastIndex1 = segLen1 - 1;
        var lastIndex2 = segLen2 - 1;
        var rightLength1 = fixedLength1 ? segLen1 : lastIndex1 - varLengthIndex1;
        var rightLength2 = fixedLength2 ? segLen2 : lastIndex2 - varLengthIndex2;
        var rightLength = Math.min(rightLength1, rightLength2);
        for (var i = 0; i < rightLength; i += 1) {
            if (!intersectParsedSegment.intersectParsedSegment(segments1[lastIndex1 - i], segments2[lastIndex2 - i])) {
                return false;
            }
        }
        return true;
    };

    });

    unwrapExports(intersectSegmentsMatcher);
    var intersectSegmentsMatcher_1 = intersectSegmentsMatcher.intersectSegmentsMatcher;

    var ParsedSegment_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    var Subset = compareCommon.CompareResult.Subset, Identity = compareCommon.CompareResult.Identity, Superset = compareCommon.CompareResult.Superset;
    var Nil = _const$1.SegmentType.Nil, Value = _const$1.SegmentType.Value, Wild = _const$1.SegmentType.Wild, Or = _const$1.SegmentType.Or, NotOr = _const$1.SegmentType.NotOr;
    var length1 = [1, 1];
    var length01 = [0, 1];
    var length0p = [0, Infinity];
    var ParsedSegment = (function () {
        function ParsedSegment(pattern) {
            switch (pattern) {
                case _const$1.w1:
                case '!()':
                    this.pattern = _const$1.w1;
                    this.type = Wild;
                    this.length = length1;
                    return;
                case _const$1.w01:
                    this.pattern = pattern;
                    this.type = Wild;
                    this.length = length01;
                    return;
                case _const$1.w0p:
                    this.pattern = pattern;
                    this.type = Wild;
                    this.length = length0p;
                    return;
                case _const$1.EmptySet:
                    this.pattern = pattern;
                    this.type = Nil;
                    this.length = length1;
                    return;
                default:
                    this.pattern = pattern;
                    this.length = length1;
            }
            if (pattern[pattern.length - 1] === ')') {
                if (pattern[0] === '(') {
                    this.type = Or;
                    return;
                }
                if (pattern[0] === '!' && pattern[1] === '(') {
                    this.type = NotOr;
                    return;
                }
            }
            this.type = Value;
        }
        Object.defineProperty(ParsedSegment.prototype, "fixedLength", {
            get: function () {
                var _a = this.length, min = _a[0], max = _a[1];
                return min === max;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedSegment.prototype, "enums", {
            get: function () {
                if (this._enums === undefined) {
                    var pattern = this.pattern;
                    switch (this.type) {
                        case Value:
                        case Wild:
                            this._enums = [pattern];
                            break;
                        case Nil:
                            this._enums = [];
                            break;
                        case Or:
                            this._enums = pattern.substring(1, pattern.length - 1).split('|');
                            break;
                        case NotOr:
                            this._enums = pattern.substring(2, pattern.length - 1).split('|');
                            break;
                    }
                }
                return this._enums;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedSegment.prototype, "enumMap", {
            get: function () {
                if (this._enumMap === undefined) {
                    var enums = this.enums;
                    var set = {};
                    for (var i = 0, len = enums.length; i < len; i += 1) {
                        set[enums[i]] = 1;
                    }
                    this._enumMap = set;
                }
                return this._enumMap;
            },
            enumerable: true,
            configurable: true
        });
        ParsedSegment.prototype.compareLength = function (_a) {
            var toLength = _a.length;
            var length = this.length;
            if (length === toLength) {
                return Identity;
            }
            if (length === length1) {
                return Subset;
            }
            if (length === length0p) {
                return Superset;
            }
            return toLength === length1 ? Superset : Subset;
        };
        return ParsedSegment;
    }());
    exports.ParsedSegment = ParsedSegment;

    });

    unwrapExports(ParsedSegment_1);
    var ParsedSegment_2 = ParsedSegment_1.ParsedSegment;

    var SegmentsMatcher_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    var Nil = _const$1.SegmentType.Nil;
    var SegmentsMatcher = (function () {
        function SegmentsMatcher(pattern, separator) {
            if (separator === void 0) { separator = '/'; }
            this.pattern = pattern;
            this.separator = separator;
        }
        SegmentsMatcher.prototype.parse = function () {
            var patterns = this.pattern.split(this.separator);
            var segments = new Array(patterns.length);
            var minSum = 0;
            var maxSum = 0;
            for (var i = 0, len = patterns.length; i < len; i += 1) {
                var segment = (segments[i] = new ParsedSegment_1.ParsedSegment(patterns[i]));
                var _a = segment.length, min = _a[0], max = _a[1];
                minSum += min;
                maxSum += max;
                if (min !== max) {
                    if (this._varLengthIndex !== undefined) {
                        throw new Error('cannot have more than one *? or **');
                    }
                    this._varLengthIndex = i;
                }
                if (segment.type === Nil) {
                    this._hasNilSegment = true;
                }
            }
            if (this._varLengthIndex === undefined) {
                this._varLengthIndex = -1;
            }
            this._length = [minSum, maxSum];
            this._segments = segments;
        };
        SegmentsMatcher.prototype.segments = function () {
            if (this._segments === undefined) {
                this.parse();
            }
            return this._segments;
        };
        Object.defineProperty(SegmentsMatcher.prototype, "length", {
            get: function () {
                if (this._length === undefined) {
                    this.parse();
                }
                return this._length;
            },
            enumerable: true,
            configurable: true
        });
        return SegmentsMatcher;
    }());
    exports.SegmentsMatcher = SegmentsMatcher;

    });

    unwrapExports(SegmentsMatcher_1);
    var SegmentsMatcher_2 = SegmentsMatcher_1.SegmentsMatcher;

    var browser = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.CompareResult = compareCommon.CompareResult;
    exports.NotOrToNotOr = compareCommon.NotOrToNotOr;
    exports.NotOrToOr = compareCommon.NotOrToOr;
    exports.OrToNotOr = compareCommon.OrToNotOr;

    exports.compilePathWithParams = compilePathWithParams.compilePathWithParams;
    exports.endsWith = compilePathWithParams.endsWith;
    exports.startsWith = compilePathWithParams.startsWith;

    exports.getWildcardStringMatcher = stringMatcher.getWildcardStringMatcher;

    exports.isNotOrExp = common.isNotOrExp;

    exports.compareArray = compareArray.compareArray;

    exports.compareProp = compareProp.compareProp;

    exports.compareValueToArray = compareValueToArray.compareValueToArray;

    exports.MatchAny = _const.MatchAny;
    exports.MatchNone = _const.MatchNone;
    exports.Not = _const.Not;
    exports.ObjectPropType = _const.ObjectPropType;
    exports.WildKey = _const.WildKey;

    exports.intersectArray = intersectArray.intersectArray;

    exports.intersectProp = intersectProp.intersectProp;

    exports.matchObject = matchObject.matchObject;

    exports.MatchProp = parseProp.MatchProp;
    exports.NoMatchProp = parseProp.NoMatchProp;
    exports.parseProp = parseProp.parseProp;

    exports.subsetArray = subsetArray.subsetArray;

    exports.compareKeySet = compareKeySet.compareKeySet;

    exports.compareParsedSegment = compareParsedSegment.compareParsedSegment;

    exports.compareRange = compareRange.compareRange;

    exports.compareSegmentsMatcher = compareSegmentsMatcher.compareSegmentsMatcher;

    exports.EmptySet = _const$1.EmptySet;
    exports.SegmentType = _const$1.SegmentType;
    exports.w01 = _const$1.w01;
    exports.w0p = _const$1.w0p;
    exports.w1 = _const$1.w1;

    exports.intersectKeySet = intersectKeySet.intersectKeySet;

    exports.intersectParsedSegment = intersectParsedSegment.intersectParsedSegment;

    exports.intersectSegmentsMatcher = intersectSegmentsMatcher.intersectSegmentsMatcher;

    exports.ParsedSegment = ParsedSegment_1.ParsedSegment;

    exports.SegmentsMatcher = SegmentsMatcher_1.SegmentsMatcher;

    exports.subsetKeySet = subsetKeySet.subsetKeySet;

    });

    unwrapExports(browser);
    var browser_1 = browser.CompareResult;
    var browser_2 = browser.NotOrToNotOr;
    var browser_3 = browser.NotOrToOr;
    var browser_4 = browser.OrToNotOr;
    var browser_5 = browser.compilePathWithParams;
    var browser_6 = browser.endsWith;
    var browser_7 = browser.startsWith;
    var browser_8 = browser.getWildcardStringMatcher;
    var browser_9 = browser.isNotOrExp;
    var browser_10 = browser.compareArray;
    var browser_11 = browser.compareProp;
    var browser_12 = browser.compareValueToArray;
    var browser_13 = browser.MatchAny;
    var browser_14 = browser.MatchNone;
    var browser_15 = browser.Not;
    var browser_16 = browser.ObjectPropType;
    var browser_17 = browser.WildKey;
    var browser_18 = browser.intersectArray;
    var browser_19 = browser.intersectProp;
    var browser_20 = browser.matchObject;
    var browser_21 = browser.MatchProp;
    var browser_22 = browser.NoMatchProp;
    var browser_23 = browser.parseProp;
    var browser_24 = browser.subsetArray;
    var browser_25 = browser.compareKeySet;
    var browser_26 = browser.compareParsedSegment;
    var browser_27 = browser.compareRange;
    var browser_28 = browser.compareSegmentsMatcher;
    var browser_29 = browser.EmptySet;
    var browser_30 = browser.SegmentType;
    var browser_31 = browser.w01;
    var browser_32 = browser.w0p;
    var browser_33 = browser.w1;
    var browser_34 = browser.intersectKeySet;
    var browser_35 = browser.intersectParsedSegment;
    var browser_36 = browser.intersectSegmentsMatcher;
    var browser_37 = browser.ParsedSegment;
    var browser_38 = browser.SegmentsMatcher;
    var browser_39 = browser.subsetKeySet;

    function match(first, second) {
        return first === second || browser_8(first)(second);
    }
    function goFurther(wildcard, currentObj, partIndex, currentPath, result = {}, delimeter = '.') {
        if (Array.isArray(currentObj)) {
            return handleArray(wildcard, currentObj, partIndex, currentPath, result);
        }
        else if (currentObj.constructor.name === 'Object') {
            return handleObject(wildcard, currentObj, partIndex, currentPath, result);
        }
    }
    function handleArray(wildcard, currentArr, partIndex, path, result = {}, delimeter = '.') {
        let nextPartIndex = wildcard.indexOf(delimeter, partIndex);
        let end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcard.length;
        }
        const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
        let index = 0;
        for (const item of currentArr) {
            const currentPath = path === `` ? index.toString() : `${path}${delimeter}${index}`;
            if (currentWildcardPath === `*` || match(currentWildcardPath, index.toString())) {
                end ? (result[currentPath] = item) : goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
            }
            index++;
        }
        return result;
    }
    function handleObject(wildcard, currentObj, partIndex, path, result = {}, delimeter = '.') {
        let nextPartIndex = wildcard.indexOf(delimeter, partIndex);
        let end = false;
        if (nextPartIndex === -1) {
            end = true;
            nextPartIndex = wildcard.length;
        }
        const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
        for (const key in currentObj) {
            const currentPath = path === `` ? key : `${path}${delimeter}${key}`;
            if (currentWildcardPath === `*` || match(currentWildcardPath, key)) {
                end
                    ? (result[currentPath] = currentObj[key])
                    : goFurther(wildcard, currentObj[key], nextPartIndex + 1, currentPath, result);
            }
        }
        return result;
    }
    function scanObject(obj, delimeter = '.') {
        return {
            get(wildcard) {
                return goFurther(wildcard, obj, 0, '', {}, delimeter);
            }
        };
    }
    var wildcard = { scanObject, match };

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

    const scanObject$1 = wildcard.scanObject;
    const match$1 = wildcard.match;
    const defaultOptions = { delimeter: '.', notRecursive: ';', param: ':', useCache: false, usePathCache: true };
    const defaultListenerOptions = { bulk: false, debug: false, source: '' };
    const defaultUpdateOptions = { only: [], source: '', debug: false };
    class DeepState {
        constructor(data = {}, options = defaultOptions) {
            this.listeners = {};
            this.data = data;
            this.options = Object.assign({}, defaultOptions, options);
            this.id = 0;
            this.pathGet = ObjectPath.get;
            this.pathSet = ObjectPath.set;
            this.scan = scanObject$1(this.data, this.options.delimeter);
        }
        getListeners() {
            return this.listeners;
        }
        destroy() {
            this.data = undefined;
            this.listeners = {};
        }
        match(first, second) {
            if (first === second) {
                return true;
            }
            return this.isWildcard(first) ? match$1(first, second) : false;
        }
        cutPath(longer, shorter) {
            return this.split(this.cleanNotRecursivePath(longer))
                .slice(0, this.split(this.cleanNotRecursivePath(shorter)).length)
                .join(this.options.delimeter);
        }
        trimPath(path) {
            return this.cleanNotRecursivePath(path).replace(new RegExp(`^\\${this.options.delimeter}*`), '');
        }
        split(path) {
            return path === '' ? [] : path.split(this.options.delimeter);
        }
        isWildcard(path) {
            return path.indexOf('*') > -1;
        }
        isRecursive(path) {
            return !path.endsWith(this.options.notRecursive);
        }
        isNotRecursive(path) {
            return !this.isRecursive(path);
        }
        cleanNotRecursivePath(path) {
            return this.isNotRecursive(path) ? path.slice(0, -this.options.notRecursive.length) : path;
        }
        recursiveMatch(listenerPath, modifiedPath) {
            return this.cutPath(modifiedPath, listenerPath) === listenerPath;
        }
        hasParams(path) {
            return path.indexOf(this.options.param) > -1;
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
                paramsInfo.params[partIndex].replaced = part.replace(reg, '*');
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
                let result = false;
                if (isRecursive) {
                    path = this.cutPath(path, listenerPath);
                }
                if (isWildcard && wildcard.match(listenerPath, path)) {
                    result = true;
                }
                else {
                    result = listenerPath === path;
                }
                return result;
            };
        }
        debugSubscribe(listener, listenersCollection, listenerPath) {
            if (listener.options.debug) {
                console.debug('listener subscribed', listenerPath, listener, listenersCollection);
            }
        }
        getListenersCollection(listenerPath, listener) {
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
            let listenersCollection;
            if (typeof this.listeners[collCfg.path] === 'undefined') {
                listenersCollection = this.listeners[collCfg.path] = this.getCleanListenersCollection(Object.assign({}, collCfg, { match: this.getListenerCollectionMatch(collCfg.path, collCfg.isRecursive, collCfg.isWildcard) }));
            }
            else {
                listenersCollection = this.listeners[collCfg.path];
            }
            this.id++;
            listenersCollection.listeners[this.id] = listener;
            return listenersCollection;
        }
        subscribe(listenerPath, fn, options = defaultListenerOptions) {
            if (typeof listenerPath === 'function') {
                fn = listenerPath;
                listenerPath = '';
            }
            let listener = this.getCleanListener(fn, options);
            const listenersCollection = this.getListenersCollection(listenerPath, listener);
            listenerPath = listenersCollection.path;
            if (!listenersCollection.isWildcard) {
                fn(this.pathGet(this.split(listenerPath), this.data), listenerPath, this.getParams(listenersCollection.paramsInfo, listenerPath));
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
                    fn(bulkValue, undefined, undefined);
                }
                else {
                    for (const path in paths) {
                        fn(paths[path], path, this.getParams(listenersCollection.paramsInfo, path));
                    }
                }
            }
            this.debugSubscribe(listener, listenersCollection, listenerPath);
            return this.unsubscribe(listenerPath, this.id);
        }
        unsubscribe(path, id) {
            return () => {
                delete this.listeners[path].listeners[id];
                if (Object.keys(this.listeners[path].listeners).length === 0) {
                    delete this.listeners[path];
                }
            };
        }
        same(newValue, oldValue) {
            return ((['number', 'string', 'undefined', 'boolean'].includes(typeof newValue) || newValue === null) &&
                oldValue === newValue);
        }
        debugListener(listener, time, value, params, path, listenerPath) {
            if (listener.options.debug) {
                console.debug('listener fired', {
                    time: Date.now() - time,
                    value,
                    params,
                    path,
                    listenerPath,
                    options: listener.options
                });
            }
        }
        debugTime(listener) {
            return listener.options.debug ? Date.now() : 0;
        }
        notifySubscribedListeners(modifiedPath, newValue, alreadyNotified = []) {
            for (let listenerPath in this.listeners) {
                const listenersCollection = this.listeners[listenerPath];
                if (listenersCollection.match(modifiedPath)) {
                    alreadyNotified.push(listenersCollection);
                    const value = listenersCollection.isRecursive || listenersCollection.isWildcard
                        ? this.get(this.cutPath(modifiedPath, listenerPath))
                        : newValue;
                    const params = listenersCollection.paramsInfo
                        ? this.getParams(listenersCollection.paramsInfo, modifiedPath)
                        : undefined;
                    for (const listenerId in listenersCollection.listeners) {
                        const listener = listenersCollection.listeners[listenerId];
                        const time = this.debugTime(listener);
                        listener.options.bulk
                            ? listener.fn([{ value, path: modifiedPath, params }], undefined, undefined)
                            : listener.fn(value, modifiedPath, params);
                        this.debugListener(listener, time, value, params, modifiedPath, listenerPath);
                    }
                }
            }
            return alreadyNotified;
        }
        notifyNestedListeners(modifiedPath, newValue, alreadyNotified) {
            for (let listenerPath in this.listeners) {
                const listenersCollection = this.listeners[listenerPath];
                if (alreadyNotified.includes(listenersCollection)) {
                    continue;
                }
                const currentCuttedPath = this.cutPath(listenerPath, modifiedPath);
                if (this.match(currentCuttedPath, modifiedPath)) {
                    const restPath = this.trimPath(listenerPath.substr(currentCuttedPath.length));
                    const values = wildcard.scanObject(newValue, this.options.delimeter).get(restPath);
                    const params = listenersCollection.paramsInfo
                        ? this.getParams(listenersCollection.paramsInfo, modifiedPath)
                        : undefined;
                    const bulk = [];
                    for (const currentRestPath in values) {
                        const value = values[currentRestPath];
                        const fullPath = [modifiedPath, currentRestPath].join(this.options.delimeter);
                        for (const listenerId in listenersCollection.listeners) {
                            const listener = listenersCollection.listeners[listenerId];
                            const time = this.debugTime(listener);
                            listener.options.bulk ? bulk.push({ value, path: fullPath, params }) : listener.fn(value, fullPath, params);
                            this.debugListener(listener, time, value, params, modifiedPath, listenerPath);
                        }
                    }
                    for (const listenerId in listenersCollection.listeners) {
                        const listener = listenersCollection.listeners[listenerId];
                        if (listener.options.bulk) {
                            const time = this.debugTime(listener);
                            listener.fn(bulk, undefined, undefined);
                            this.debugListener(listener, time, bulk, params, modifiedPath, listenerPath);
                        }
                    }
                }
            }
        }
        notifyOnly(modifiedPath, newValue, options) {
            if (typeof options.only !== 'undefined' &&
                Array.isArray(options.only) &&
                options.only.length &&
                this.canBeNested(newValue)) {
                options.only.forEach((notifyPath) => {
                    const wildcardScan = wildcard.scanObject(newValue, this.options.delimeter).get(notifyPath);
                    const bulk = [];
                    const bulkListeners = [];
                    for (const wildcardPath in wildcardScan) {
                        const fullPath = modifiedPath + this.options.delimeter + wildcardPath;
                        for (const listenerPath in this.listeners) {
                            const listenersCollection = this.listeners[listenerPath];
                            const params = listenersCollection.paramsInfo
                                ? this.getParams(listenersCollection.paramsInfo, fullPath)
                                : undefined;
                            if (this.match(listenerPath, fullPath)) {
                                const value = wildcardScan[wildcardPath];
                                bulk.push({ value, path: fullPath, params });
                                for (const listenerId in listenersCollection.listeners) {
                                    const listener = listenersCollection.listeners[listenerId];
                                    if (listener.options.bulk) {
                                        if (!bulkListeners.some((bulkListener) => bulkListener.listener === listener)) {
                                            bulkListeners.push({ listener, params, listenerPath });
                                        }
                                    }
                                    else {
                                        const time = this.debugTime(listener);
                                        listener.fn(value, fullPath, params);
                                        this.debugListener(listener, time, bulk, params, modifiedPath, listenerPath);
                                    }
                                }
                            }
                        }
                    }
                    for (const bulkListener of bulkListeners) {
                        const time = this.debugTime(bulkListener.listener);
                        bulkListener.listener.fn(bulk, undefined, undefined);
                        this.debugListener(bulkListener.listener, time, bulk, bulkListener.params, modifiedPath, bulkListener.listenerPath);
                    }
                });
                return true;
            }
            return false;
        }
        canBeNested(newValue) {
            if (typeof newValue !== 'undefined' && newValue !== null) {
                if (newValue.constructor.name === 'Object' || Array.isArray(newValue)) {
                    return true;
                }
            }
            return false;
        }
        update(modifiedPath, fn, options = defaultUpdateOptions) {
            if (this.isWildcard(modifiedPath)) {
                for (const path in this.scan.get(modifiedPath)) {
                    this.update(path, fn, options);
                }
                return;
            }
            const split = this.split(modifiedPath);
            let oldValue = this.pathGet(split, this.data);
            if (typeof oldValue !== 'undefined' && oldValue !== null) {
                if (typeof oldValue === 'object' && oldValue.constructor.name === 'Object') {
                    oldValue = Object.assign({}, oldValue);
                }
                else if (Array.isArray(oldValue)) {
                    oldValue = oldValue.slice();
                }
            }
            let newValue;
            if (typeof fn === 'function') {
                newValue = fn(this.pathGet(split, this.data));
            }
            else {
                newValue = fn;
            }
            if (options.debug) {
                console.debug(`Updating ${modifiedPath} ${options.source ? `from ${options.source}` : ''}`, oldValue, newValue);
            }
            if (this.same(newValue, oldValue)) {
                return newValue;
            }
            this.pathSet(split, newValue, this.data);
            options = Object.assign({}, defaultUpdateOptions, options);
            if (this.notifyOnly(modifiedPath, newValue, options)) {
                return newValue;
            }
            const alreadyNotified = this.notifySubscribedListeners(modifiedPath, newValue);
            if (this.canBeNested(newValue)) {
                this.notifyNestedListeners(modifiedPath, newValue, alreadyNotified);
            }
            return newValue;
        }
        get(userPath = undefined) {
            if (typeof userPath === 'undefined' || userPath === '') {
                return this.data;
            }
            return this.pathGet(this.split(userPath), this.data);
        }
    }
    const State = DeepState;

    exports.State = State;
    exports.default = DeepState;
    exports.match = match$1;
    exports.scanObject = scanObject$1;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
