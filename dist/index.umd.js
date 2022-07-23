(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DeepStateObserver = factory());
})(this, (function () { 'use strict';

  class DeepStateObserver {
    test() {
      console.log("test");
    }

    #priv() {
      console.log("private");
    }
  }

  return DeepStateObserver;

}));
//# sourceMappingURL=index.umd.js.map
