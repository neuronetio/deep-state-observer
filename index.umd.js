(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global['svelte-deep-store'] = {}));
}(this, function (exports) { 'use strict';

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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var fastCopy = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
     module.exports = factory() ;
  }(commonjsGlobal, function () {
    var toStringFunction = Function.prototype.toString;
    var create = Object.create, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, getOwnPropertyNames = Object.getOwnPropertyNames, getOwnPropertySymbols = Object.getOwnPropertySymbols, getPrototypeOf = Object.getPrototypeOf;
    var _a = Object.prototype, hasOwnProperty = _a.hasOwnProperty, propertyIsEnumerable = _a.propertyIsEnumerable;
    /**
     * @enum
     *
     * @const {Object} SUPPORTS
     *
     * @property {boolean} SYMBOL_PROPERTIES are symbol properties supported
     * @property {boolean} WEAKSET is WeakSet supported
     */
    var SUPPORTS = {
        SYMBOL_PROPERTIES: typeof getOwnPropertySymbols === 'function',
        WEAKSET: typeof WeakSet === 'function',
    };
    /**
     * @function createCache
     *
     * @description
     * get a new cache object to prevent circular references
     *
     * @returns the new cache object
     */
    var createCache = function () {
        if (SUPPORTS.WEAKSET) {
            return new WeakSet();
        }
        var object = create({
            add: function (value) { return object._values.push(value); },
            has: function (value) { return !!~object._values.indexOf(value); },
        });
        object._values = [];
        return object;
    };
    /**
     * @function getCleanClone
     *
     * @description
     * get an empty version of the object with the same prototype it has
     *
     * @param object the object to build a clean clone from
     * @param realm the realm the object resides in
     * @returns the empty cloned object
     */
    var getCleanClone = function (object, realm) {
        if (!object.constructor) {
            return create(null);
        }
        var prototype = object.__proto__ || getPrototypeOf(object);
        if (object.constructor === realm.Object) {
            return prototype === realm.Object.prototype ? {} : create(prototype);
        }
        if (~toStringFunction.call(object.constructor).indexOf('[native code]')) {
            try {
                return new object.constructor();
            }
            catch (_a) { }
        }
        return create(prototype);
    };
    /**
     * @function getObjectCloneLoose
     *
     * @description
     * get a copy of the object based on loose rules, meaning all enumerable keys
     * and symbols are copied, but property descriptors are not considered
     *
     * @param object the object to clone
     * @param realm the realm the object resides in
     * @param handleCopy the function that handles copying the object
     * @returns the copied object
     */
    var getObjectCloneLoose = function (object, realm, handleCopy, cache) {
        var clone = getCleanClone(object, realm);
        for (var key in object) {
            if (hasOwnProperty.call(object, key)) {
                clone[key] = handleCopy(object[key], cache);
            }
        }
        if (SUPPORTS.SYMBOL_PROPERTIES) {
            var symbols = getOwnPropertySymbols(object);
            if (symbols.length) {
                for (var index = 0, symbol = void 0; index < symbols.length; index++) {
                    symbol = symbols[index];
                    if (propertyIsEnumerable.call(object, symbol)) {
                        clone[symbol] = handleCopy(object[symbol], cache);
                    }
                }
            }
        }
        return clone;
    };
    /**
     * @function getObjectCloneStrict
     *
     * @description
     * get a copy of the object based on strict rules, meaning all keys and symbols
     * are copied based on the original property descriptors
     *
     * @param object the object to clone
     * @param realm the realm the object resides in
     * @param handleCopy the function that handles copying the object
     * @returns the copied object
     */
    var getObjectCloneStrict = function (object, realm, handleCopy, cache) {
        var clone = getCleanClone(object, realm);
        var properties = SUPPORTS.SYMBOL_PROPERTIES
            ? [].concat(getOwnPropertyNames(object), getOwnPropertySymbols(object))
            : getOwnPropertyNames(object);
        if (properties.length) {
            for (var index = 0, property = void 0, descriptor = void 0; index < properties.length; index++) {
                property = properties[index];
                if (property !== 'callee' && property !== 'caller') {
                    descriptor = getOwnPropertyDescriptor(object, property);
                    descriptor.value = handleCopy(object[property], cache);
                    defineProperty(clone, property, descriptor);
                }
            }
        }
        return clone;
    };
    /**
     * @function getRegExpFlags
     *
     * @description
     * get the flags to apply to the copied regexp
     *
     * @param regExp the regexp to get the flags of
     * @returns the flags for the regexp
     */
    var getRegExpFlags = function (regExp) {
        var flags = '';
        if (regExp.global) {
            flags += 'g';
        }
        if (regExp.ignoreCase) {
            flags += 'i';
        }
        if (regExp.multiline) {
            flags += 'm';
        }
        if (regExp.unicode) {
            flags += 'u';
        }
        if (regExp.sticky) {
            flags += 'y';
        }
        return flags;
    };

    // utils
    var isArray = Array.isArray;
    var GLOBAL_THIS = (function () {
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window !== 'undefined') {
            return window;
        }
        if (typeof commonjsGlobal !== 'undefined') {
            return commonjsGlobal;
        }
        if (console && console.error) {
            console.error('Unable to locate global object, returning "this".');
        }
    })();
    /**
     * @function copy
     *
     * @description
     * copy an object deeply as much as possible
     *
     * If `strict` is applied, then all properties (including non-enumerable ones)
     * are copied with their original property descriptors on both objects and arrays.
     *
     * The object is compared to the global constructors in the `realm` provided,
     * and the native constructor is always used to ensure that extensions of native
     * objects (allows in ES2015+) are maintained.
     *
     * @param object the object to copy
     * @param [options] the options for copying with
     * @param [options.isStrict] should the copy be strict
     * @param [options.realm] the realm (this) object the object is copied from
     * @returns the copied object
     */
    function copy(object, options) {
        // manually coalesced instead of default parameters for performance
        var isStrict = !!(options && options.isStrict);
        var realm = (options && options.realm) || GLOBAL_THIS;
        var getObjectClone = isStrict
            ? getObjectCloneStrict
            : getObjectCloneLoose;
        /**
         * @function handleCopy
         *
         * @description
         * copy the object recursively based on its type
         *
         * @param object the object to copy
         * @returns the copied object
         */
        var handleCopy = function (object, cache) {
            if (!object || typeof object !== 'object' || cache.has(object)) {
                return object;
            }
            var Constructor = object.constructor;
            // plain objects
            if (Constructor === realm.Object) {
                cache.add(object);
                return getObjectClone(object, realm, handleCopy, cache);
            }
            var clone;
            // arrays
            if (isArray(object)) {
                cache.add(object);
                // if strict, include non-standard properties
                if (isStrict) {
                    return getObjectCloneStrict(object, realm, handleCopy, cache);
                }
                clone = new Constructor();
                for (var index = 0; index < object.length; index++) {
                    clone[index] = handleCopy(object[index], cache);
                }
                return clone;
            }
            // dates
            if (object instanceof realm.Date) {
                return new Constructor(object.getTime());
            }
            // regexps
            if (object instanceof realm.RegExp) {
                clone = new Constructor(object.source, object.flags || getRegExpFlags(object));
                clone.lastIndex = object.lastIndex;
                return clone;
            }
            // maps
            if (realm.Map && object instanceof realm.Map) {
                cache.add(object);
                clone = new Constructor();
                object.forEach(function (value, key) {
                    clone.set(key, handleCopy(value, cache));
                });
                return clone;
            }
            // sets
            if (realm.Set && object instanceof realm.Set) {
                cache.add(object);
                clone = new Constructor();
                object.forEach(function (value) {
                    clone.add(handleCopy(value, cache));
                });
                return clone;
            }
            // buffers (node-only)
            if (realm.Buffer && realm.Buffer.isBuffer(object)) {
                clone = realm.Buffer.allocUnsafe
                    ? realm.Buffer.allocUnsafe(object.length)
                    : new Constructor(object.length);
                object.copy(clone);
                return clone;
            }
            // arraybuffers / dataviews
            if (realm.ArrayBuffer) {
                // dataviews
                if (realm.ArrayBuffer.isView(object)) {
                    return new Constructor(object.buffer.slice(0));
                }
                // arraybuffers
                if (object instanceof realm.ArrayBuffer) {
                    return object.slice(0);
                }
            }
            // if the object cannot / should not be cloned, don't
            if (
            // promise-like
            typeof object.then === 'function' ||
                // errors
                object instanceof Error ||
                // weakmaps
                (realm.WeakMap && object instanceof realm.WeakMap) ||
                // weaksets
                (realm.WeakSet && object instanceof realm.WeakSet)) {
                return object;
            }
            cache.add(object);
            // assume anything left is a custom constructor
            return getObjectClone(object, realm, handleCopy, cache);
        };
        return handleCopy(object, createCache());
    }
    /**
     * @function strictCopy
     *
     * @description
     * copy the object with `strict` option pre-applied
     *
     * @param object the object to copy
     * @param [options] the options for copying with
     * @param [options.realm] the realm (this) object the object is copied from
     * @returns the copied object
     */
    copy.strict = function strictCopy(object, options) {
        return copy(object, {
            isStrict: true,
            realm: options ? options.realm : void 0,
        });
    };

    return copy;

  }));

  });

  function wildcardToRegex(wildcard, delimeter = '.') {
      return new RegExp('^' +
          wildcard
              .split('**')
              .map((part) => {
              return part
                  .split('*')
                  .map((smallPart) => smallPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                  .join(`[^\\${delimeter}]*`);
          })
              .join(`.*`) +
          '$');
  }
  function match(first, second, delimeter = '.') {
      return wildcardToRegex(first, delimeter).test(second);
  }
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
  var wildcard = { scanObject, match, wildcardToRegex };

  const scanObject$1 = wildcard.scanObject;
  const match$1 = wildcard.match;
  const wildcardToRegex$1 = wildcard.wildcardToRegex;
  class DeepStore {
      constructor(data = {}, options = { delimeter: '.' }) {
          this.listeners = {};
          this.data = data;
          this.options = options;
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
          if (this.isWildcard(first)) {
              return match$1(first, second, this.options.delimeter);
          }
          return false;
      }
      split(path) {
          if (path === '') {
              return [];
          }
          return path.split(this.options.delimeter);
      }
      isWildcard(path) {
          return path.indexOf('*') > -1;
      }
      subscribeAll(userPaths, fn) {
          let unsubscribers = [];
          for (const userPath of userPaths) {
              const wrappedSubscriber = ((newValue) => {
                  fn(userPath, newValue);
              });
              unsubscribers.push(this.subscribe(userPath, wrappedSubscriber));
          }
          return () => {
              for (const unsubscribe of unsubscribers) {
                  unsubscribe();
              }
              unsubscribers = [];
          };
      }
      subscribe(userPath, fn, execute = true) {
          if (typeof userPath === 'function') {
              fn = userPath;
              userPath = '';
          }
          if (!Array.isArray(this.listeners[userPath])) {
              this.listeners[userPath] = [];
          }
          this.listeners[userPath].push(fn);
          const isWildcard = this.isWildcard(userPath);
          if (execute && !isWildcard) {
              fn(path(this.split(userPath), this.data), userPath);
          }
          if (isWildcard) {
              const paths = scanObject$1(this.data, this.options.delimeter).get(userPath);
              for (const path in paths) {
                  fn(paths[path], path);
              }
          }
          return this.unsubscribe(fn);
      }
      unsubscribe(fn) {
          return () => {
              for (const currentPath in this.listeners) {
                  this.listeners[currentPath] = this.listeners[currentPath].filter((current) => current !== fn);
                  if (this.listeners[currentPath].length === 0) {
                      delete this.listeners[currentPath];
                  }
              }
          };
      }
      update(userPath, fn) {
          const lens = lensPath(this.split(userPath));
          let oldValue = fastCopy(view(lens, this.data));
          let newValue;
          if (typeof fn === 'function') {
              newValue = fn(view(lens, this.data));
          }
          else {
              newValue = fn;
          }
          if ((['number', 'string', 'undefined', 'boolean'].includes(typeof newValue) || newValue === null) &&
              oldValue === newValue) {
              return newValue;
          }
          this.data = set(lens, newValue, this.data);
          for (const currentPath in this.listeners) {
              if (this.match(currentPath, userPath)) {
                  for (const listener of this.listeners[currentPath]) {
                      listener(newValue, userPath);
                  }
              }
          }
          return newValue;
      }
      get(userPath = undefined) {
          if (typeof userPath === 'undefined' || userPath === '') {
              return this.data;
          }
          return path(userPath.split('.'), this.data);
      }
      static clone(obj) {
          return fastCopy(obj);
      }
  }
  const Store = DeepStore;

  exports.Store = Store;
  exports.default = DeepStore;
  exports.match = match$1;
  exports.scanObject = scanObject$1;
  exports.wildcardToRegex = wildcardToRegex$1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
