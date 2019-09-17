'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _isPlaceholder(a) {
       return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };
    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };
    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };
    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };
    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };
    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };
    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };
    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };
    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };
    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };
    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };
    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;
    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;
      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }
      combined[combinedIdx] = result;
      if (!_isPlaceholder(result)) {
        left -= 1;
      }
      combinedIdx += 1;
    }
    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
  };
}

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */
var curryN = /*#__PURE__*/_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }
  return _arity(length, _curryN(length, [], fn));
});

/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;
      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        });
      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function (_c) {
          return fn(a, b, _c);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
var _isArray = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

function _isTransformer(obj) {
  return obj != null && typeof obj['@@transducer/step'] === 'function';
}

/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a function with one of the given method names, it will
 * execute that function (functor case). Otherwise, if it is a transformer,
 * uses transducer [xf] to return a new transformer (transducer case).
 * Otherwise, it will default to executing [fn].
 *
 * @private
 * @param {Array} methodNames properties to check for a custom implementation
 * @param {Function} xf transducer to initialize if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */
function _dispatchable(methodNames, xf, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }
    var args = Array.prototype.slice.call(arguments, 0);
    var obj = args.pop();
    if (!_isArray(obj)) {
      var idx = 0;
      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, args);
        }
        idx += 1;
      }
      if (_isTransformer(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }
    return fn.apply(this, arguments);
  };
}

var _xfBase = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};

function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);
  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }
  return result;
}

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */
var _isArrayLike = /*#__PURE__*/_curry1(function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }
  if (!x) {
    return false;
  }
  if (typeof x !== 'object') {
    return false;
  }
  if (_isString(x)) {
    return false;
  }
  if (x.nodeType === 1) {
    return !!x.length;
  }
  if (x.length === 0) {
    return true;
  }
  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }
  return false;
});

var XWrap = /*#__PURE__*/function () {
  function XWrap(fn) {
    this.f = fn;
  }
  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };
  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };
  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}

/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      const log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */
var bind = /*#__PURE__*/_curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);
    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }
    idx += 1;
  }
  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();
  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);
    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }
    step = iter.next();
  }
  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';

function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = _xwrap(fn);
  }
  if (_isArrayLike(list)) {
    return _arrayReduce(fn, acc, list);
  }
  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }
  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }
  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }
  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}

var XMap = /*#__PURE__*/function () {
  function XMap(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XMap.prototype['@@transducer/init'] = _xfBase.init;
  XMap.prototype['@@transducer/result'] = _xfBase.result;
  XMap.prototype['@@transducer/step'] = function (result, input) {
    return this.xf['@@transducer/step'](result, this.f(input));
  };

  return XMap;
}();

var _xmap = /*#__PURE__*/_curry2(function _xmap(f, xf) {
  return new XMap(f, xf);
});

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var toString = Object.prototype.toString;
var _isArguments = /*#__PURE__*/function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
}();

// cover IE < 9 keys issues
var hasEnumBug = ! /*#__PURE__*/{ toString: null }.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// Safari bug
var hasArgsEnumBug = /*#__PURE__*/function () {

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;
  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }
    idx += 1;
  }
  return false;
};

/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */
var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ? /*#__PURE__*/_curry1(function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) : /*#__PURE__*/_curry1(function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }
  var prop, nIdx;
  var ks = [];
  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }
  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;
    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];
      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }
      nIdx -= 1;
    }
  }
  return ks;
});

/**
 * Takes a function and
 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
 * applies the function to each of the functor's values, and returns
 * a functor of the same shape.
 *
 * Ramda provides suitable `map` implementations for `Array` and `Object`,
 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
 *
 * Dispatches to the `map` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * Also treats functions as functors and will compose them together.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => (a -> b) -> f a -> f b
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {Array} list The list to be iterated over.
 * @return {Array} The new list.
 * @see R.transduce, R.addIndex
 * @example
 *
 *      const double = x => x * 2;
 *
 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
 *
 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
 * @symb R.map(f, [a, b]) = [f(a), f(b)]
 * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
 * @symb R.map(f, functor_o) = functor_o.map(f)
 */
var map = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['fantasy-land/map', 'map'], _xmap, function map(fn, functor) {
  switch (Object.prototype.toString.call(functor)) {
    case '[object Function]':
      return curryN(functor.length, function () {
        return fn.call(this, functor.apply(this, arguments));
      });
    case '[object Object]':
      return _reduce(function (acc, key) {
        acc[key] = fn(functor[key]);
        return acc;
      }, {}, keys(functor));
    default:
      return _map(fn, functor);
  }
}));

/**
 * Retrieve the value at a given path.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> a | Undefined
 * @param {Array} path The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path`.
 * @see R.prop
 * @example
 *
 *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
 */
var path = /*#__PURE__*/_curry2(function path(paths, obj) {
  var val = obj;
  var idx = 0;
  while (idx < paths.length) {
    if (val == null) {
      return;
    }
    val = val[paths[idx]];
    idx += 1;
  }
  return val;
});

/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 * @example
 *
 *      const t = R.always('Tee');
 *      t(); //=> 'Tee'
 */
var always = /*#__PURE__*/_curry1(function always(val) {
  return function () {
    return val;
  };
});

/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @sig String -> a -> {k: v} -> {k: v}
 * @param {String} prop The property name to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except for the changed property.
 * @see R.dissoc, R.pick
 * @example
 *
 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
 */
var assoc = /*#__PURE__*/_curry3(function assoc(prop, val, obj) {
  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
});

/**
 * Determine if the passed argument is an integer.
 *
 * @private
 * @param {*} n
 * @category Type
 * @return {Boolean}
 */
var _isInteger = Number.isInteger || function _isInteger(n) {
  return n << 0 === n;
};

/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Type
 * @sig * -> Boolean
 * @param {*} x The value to test.
 * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 *
 *      R.isNil(null); //=> true
 *      R.isNil(undefined); //=> true
 *      R.isNil(0); //=> false
 *      R.isNil([]); //=> false
 */
var isNil = /*#__PURE__*/_curry1(function isNil(x) {
  return x == null;
});

/**
 * Makes a shallow clone of an object, setting or overriding the nodes required
 * to create the given path, and placing the specific value at the tail end of
 * that path. Note that this copies and flattens prototype properties onto the
 * new object as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> a -> {a} -> {a}
 * @param {Array} path the path to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except along the specified path.
 * @see R.dissocPath
 * @example
 *
 *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
 *
 *      // Any missing or non-object keys in path will be overridden
 *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
 */
var assocPath = /*#__PURE__*/_curry3(function assocPath(path, val, obj) {
  if (path.length === 0) {
    return val;
  }
  var idx = path[0];
  if (path.length > 1) {
    var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
    val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
  }
  if (_isInteger(idx) && _isArray(obj)) {
    var arr = [].concat(obj);
    arr[idx] = val;
    return arr;
  } else {
    return assoc(idx, val, obj);
  }
});

/**
 * Returns a lens for the given getter and setter functions. The getter "gets"
 * the value of the focus; the setter "sets" the value of the focus. The setter
 * should not mutate the data structure.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
 * @param {Function} getter
 * @param {Function} setter
 * @return {Lens}
 * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lens(R.prop('x'), R.assoc('x'));
 *
 *      R.view(xLens, {x: 1, y: 2});            //=> 1
 *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
 *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
 */
var lens = /*#__PURE__*/_curry2(function lens(getter, setter) {
  return function (toFunctorFn) {
    return function (target) {
      return map(function (focus) {
        return setter(focus, target);
      }, toFunctorFn(getter(target)));
    };
  };
});

/**
 * Returns a lens whose focus is the specified path.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @typedefn Idx = String | Int
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig [Idx] -> Lens s a
 * @param {Array} path The path to use.
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const xHeadYLens = R.lensPath(['x', 0, 'y']);
 *
 *      R.view(xHeadYLens, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> 2
 *      R.set(xHeadYLens, 1, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> {x: [{y: 1, z: 3}, {y: 4, z: 5}]}
 *      R.over(xHeadYLens, R.negate, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> {x: [{y: -2, z: 3}, {y: 4, z: 5}]}
 */
var lensPath = /*#__PURE__*/_curry1(function lensPath(p) {
  return lens(path(p), assocPath(p));
});

// `Identity` is a functor that holds a single value, where `map` simply
// transforms the held value with the provided function.
var Identity = function (x) {
  return { value: x, map: function (f) {
      return Identity(f(x));
    } };
};

/**
 * Returns the result of "setting" the portion of the given data structure
 * focused by the given lens to the result of applying the given function to
 * the focused value.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> (a -> a) -> s -> s
 * @param {Lens} lens
 * @param {*} v
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const headLens = R.lensIndex(0);
 *
 *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
 */
var over = /*#__PURE__*/_curry3(function over(lens, f, x) {
  // The value returned by the getter function is first transformed with `f`,
  // then set as the value of an `Identity`. This is then mapped over with the
  // setter function of the lens.
  return lens(function (y) {
    return Identity(f(y));
  })(x).value;
});

/**
 * Returns the result of "setting" the portion of the given data structure
 * focused by the given lens to the given value.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> a -> s -> s
 * @param {Lens} lens
 * @param {*} v
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
 *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
 */
var set = /*#__PURE__*/_curry3(function set(lens, v, x) {
  return over(lens, always(v), x);
});

// `Const` is a functor that effectively ignores the function given to `map`.
var Const = function (x) {
  return { value: x, 'fantasy-land/map': function () {
      return this;
    } };
};

/**
 * Returns a "view" of the given data structure, determined by the given lens.
 * The lens's focus determines which portion of the data structure is visible.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> s -> a
 * @param {Lens} lens
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.view(xLens, {x: 1, y: 2});  //=> 1
 *      R.view(xLens, {x: 4, y: 2});  //=> 4
 */
var view = /*#__PURE__*/_curry2(function view(lens, x) {
  // Using `Const` effectively ignores the setter function of the `lens`,
  // leaving the value returned by the getter function unmodified.
  return lens(Const)(x).value;
});

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

const match = (first, second) => {
    return browser_8(first)(second);
};
function scanObject(obj, delimeter = '.') {
    const api = {
        get(wildcard) {
            const wildcardSplit = prepareWildcardSplit(wildcard);
            if (wildcardSplit.length === 0) {
                return obj;
            }
            return handleObject(wildcardSplit, obj, 0, '');
        }
    };
    function prepareWildcardSplit(wildcardSplit) {
        if (typeof wildcardSplit === 'string') {
            if (wildcardSplit === '') {
                wildcardSplit = [];
            }
            else {
                wildcardSplit = wildcardSplit.split(delimeter);
            }
        }
        return wildcardSplit;
    }
    function isEnd(wildcardSplit, partIndex) {
        return wildcardSplit.length - 1 <= partIndex;
    }
    function goFurther(wildcardSplit, currentObj, partIndex, currentPath, result) {
        if (Array.isArray(currentObj)) {
            handleArray(wildcardSplit, currentObj, partIndex, currentPath, result);
        }
        else if (currentObj.constructor.name === 'Object') {
            handleObject(wildcardSplit, currentObj, partIndex, currentPath, result);
        }
    }
    function handleArray(wildcardSplit, currentArr, partIndex, path, result = {}) {
        const currentWildcardPath = wildcardSplit.slice(0, partIndex + 1).join(delimeter);
        const end = isEnd(wildcardSplit, partIndex);
        const fullWildcard = currentWildcardPath.indexOf('**') > -1;
        const traverse = !end || fullWildcard;
        let index = 0;
        for (const item of currentArr) {
            const currentPath = path === '' ? path + index : path + delimeter + index;
            if (match(currentWildcardPath, currentPath)) {
                if (end) {
                    result[currentPath] = item;
                }
                if (traverse) {
                    goFurther(wildcardSplit, item, partIndex + 1, currentPath, result);
                }
            }
            else if (fullWildcard) {
                goFurther(wildcardSplit, item, partIndex + 1, currentPath, result);
            }
            index++;
        }
        return result;
    }
    function handleObject(wildcardSplit, currentObj, partIndex, path, result = {}) {
        const currentWildcardPath = wildcardSplit.slice(0, partIndex + 1).join(delimeter);
        const end = isEnd(wildcardSplit, partIndex);
        const fullWildcard = currentWildcardPath.indexOf('**') > -1;
        const traverse = !end || fullWildcard;
        for (const key in currentObj) {
            const currentPath = path === '' ? path + key : path + delimeter + key;
            if (match(currentWildcardPath, currentPath)) {
                if (end) {
                    result[currentPath] = currentObj[key];
                }
                if (traverse) {
                    goFurther(wildcardSplit, currentObj[key], partIndex + 1, currentPath, result);
                }
            }
            else if (fullWildcard) {
                goFurther(wildcardSplit, currentObj[key], partIndex + 1, currentPath, result);
            }
        }
        return result;
    }
    return api;
}
var wildcard = { scanObject, match };

const scanObject$1 = wildcard.scanObject;
const match$1 = wildcard.match;
const defaultOptions = { delimeter: '.', recursive: '...', param: ':', useCache: false };
const defaultListenerOptions = { bulk: false, debug: false };
const defaultUpdateOptions = { only: [] };
function createCache() {
    const cache = {};
    const api = {
        has(key, secondKey) {
            return typeof cache[key] !== 'undefined' && typeof cache[key][secondKey] !== 'undefined';
        },
        get(key, secondKey) {
            if (this.has(key, secondKey)) {
                return cache[key][secondKey];
            }
            return undefined;
        },
        set(key, secondKey, value) {
            if (typeof cache[key] === 'undefined') {
                cache[key] = {};
            }
            cache[key][secondKey] = value;
            return value;
        },
        delete(key, secondKey) {
            if (typeof cache[key] === 'undefined') {
                return;
            }
            if (typeof secondKey === 'undefined') {
                delete cache[key];
                return;
            }
            delete cache[key][secondKey];
        }
    };
    return api;
}
class DeepState {
    constructor(data = {}, options = defaultOptions) {
        this.listeners = {};
        this.data = data;
        this.options = Object.assign({}, defaultOptions, options);
        this.cache = createCache();
        this.id = 0;
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
        if (this.options.useCache && this.cache.has(first, second)) {
            return this.cache.get(first, second).match;
        }
        const matched = this.isWildcard(first) ? match$1(first, second) : false;
        if (this.options.useCache) {
            this.cache.set(first, second, { match: matched, params: undefined });
        }
        return matched;
    }
    cutPath(longer, shorter) {
        return this.split(this.cleanRecursivePath(longer))
            .slice(0, this.split(this.cleanRecursivePath(shorter)).length)
            .join(this.options.delimeter);
    }
    trimPath(path) {
        return this.cleanRecursivePath(path).replace(new RegExp(`^\\${this.options.delimeter}+|\\${this.options.delimeter}+$`), '');
    }
    split(path) {
        return path === '' ? [] : path.split(this.options.delimeter);
    }
    isWildcard(path) {
        return path.indexOf('*') > -1;
    }
    isRecursive(path) {
        return path.endsWith(this.options.recursive);
    }
    cleanRecursivePath(path) {
        return this.isRecursive(path) ? path.slice(0, -this.options.recursive.length) : path;
    }
    recursiveMatch(listenerPath, modifiedPath) {
        return this.cutPath(modifiedPath, this.cleanRecursivePath(listenerPath)) === listenerPath;
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
            const originalPath = path;
            if (this.options.useCache && this.cache.has(listenerPath, path)) {
                return this.cache.get(listenerPath, path).match;
            }
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
            if (this.options.useCache) {
                this.cache.set(listenerPath, originalPath, { match: result, params: undefined });
            }
            return result;
        };
    }
    debugSubscribe(listener, listenersCollection, listenerPath) {
        if (listener.options.debug) {
            console.debug('listener subsrcibed', listenerPath, listener, listenersCollection);
        }
    }
    getListenersCollection(listenerPath, listener) {
        let collCfg = {
            isRecursive: false,
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
        if (this.isRecursive(collCfg.path)) {
            collCfg.path = this.cleanRecursivePath(collCfg.path);
            collCfg.isRecursive = true;
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
            fn(path(this.split(listenerPath), this.data), listenerPath, this.getParams(listenersCollection.paramsInfo, listenerPath));
        }
        if (listenersCollection.isWildcard) {
            const paths = scanObject$1(this.data, this.options.delimeter).get(listenerPath);
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
        return this.unsubscribe(listener, listenersCollection, listenerPath, this.id);
    }
    unsubscribe(listener, listenerCollection, listenerPath, id) {
        return () => {
            delete listenerCollection.listeners[id];
        };
    }
    same(newValue, oldValue) {
        return ((['number', 'string', 'undefined', 'boolean'].includes(typeof newValue) || newValue === null) &&
            oldValue === newValue);
    }
    debugListener(listener, time, value, params, path, listenerPath) {
        if (listener.options.debug) {
            console.debug('listener updated', {
                time: Date.now() - time,
                value,
                params,
                path,
                listenerPath
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
                const value = listenersCollection.isRecursive ? this.get(this.cutPath(modifiedPath, listenerPath)) : newValue;
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
                        if (this.match(listenerPath, fullPath)) {
                            const params = listenersCollection.paramsInfo
                                ? this.getParams(listenersCollection.paramsInfo, fullPath)
                                : undefined;
                            const value = wildcardScan[wildcardPath];
                            bulk.push({ value, path: fullPath, params });
                            for (const listenerId in listenersCollection.listeners) {
                                const listener = listenersCollection.listeners[listenerId];
                                if (listener.options.bulk) {
                                    if (!bulkListeners.includes(listener)) {
                                        bulkListeners.push(listener);
                                    }
                                }
                                else {
                                    listener.fn(value, fullPath, params);
                                }
                            }
                        }
                    }
                }
                for (const listener of bulkListeners) {
                    listener.fn(bulk, undefined, undefined);
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
            for (const path in wildcard.scanObject(this.data, this.options.delimeter).get(modifiedPath)) {
                this.update(path, fn);
            }
            return;
        }
        const lens = lensPath(this.split(modifiedPath));
        let oldValue = view(lens, this.data);
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
            newValue = fn(view(lens, this.data));
        }
        else {
            newValue = fn;
        }
        if (this.same(newValue, oldValue)) {
            return newValue;
        }
        this.data = set(lens, newValue, this.data);
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
        return path(this.split(userPath), this.data);
    }
}
const State = DeepState;

exports.State = State;
exports.default = DeepState;
exports.match = match$1;
exports.scanObject = scanObject$1;
