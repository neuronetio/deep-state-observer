[![GitHub license](https://img.shields.io/github/license/neuronetio/deep-state-observer?style=flat-square)](https://github.com/neuronetio/deep-state-observer/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/neuronetio/deep-state-observer)](https://github.com/neuronetio/deep-state-observer/issues)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/neuronetio/deep-state-observer)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fneuronetio%2Fdeep-state-observer)

# deep-state-observer for high performance apps

Deep state observer is an state management library which will trigger an update only when specified object node was changed.
You don't need to reevaluate or re-render whole app/component when only one portion of the state was modified.

### Used in the right hands can significantly increase performance!

Deep state observer is framework agnostic with node and browser support, so you can use it in most of your projects.

# Install

`npm i deep-state-observer`

# Examples

[here](https://svelte.dev/repl/a3637b5e83914c9b89f10c8cd422c747?version=3.12.1) and [here](https://svelte.dev/repl/3e9f95108e5f44c0921b1c3fab8574e7?version=3.12.1)

# Usage

## Svelte example

```javascript
import { onDestroy } from 'svelte';
import State from 'deep-state-observer'; // const State = require('deep-state-observer');

// first parameter is an object that hold the state, and the second one is just options
const state = new State({
  some: 'value',
  someOther: {
      nested: 'value'
    }
  },
  // options
  { delimiter:'.' , notRecursive:';',  param: ':', log: console.log }
);

// store some unsubscribe methods
let subscribers = [];

// change local variable - it can be vueComponent.data property or react function with setState in react
let nestedValue;
subscribers.push(
  state.subscribe('someOther.nested', (value, eventInfo) => {
    nestedValue = value;
  })
);

let some;
subscribers.push(
  state.subscribeAll(['some', 'someOther'], (value, eventInfo) => {
    if (eventInfo.path.resolved === 'some') {
      some = value;
    } else if (eventInfo.path.resolved === 'someOther') {
      nestedValue = value.nested;
    }
  })
);

state.update('someOther.nested', (currentValue) => {
  return 'new value';
});

// you can use function to modify data
subscribers.push(
  state.subscribe('some', (value, eventInfo) => {
    state.update('someOther.nested', (oldValue) => {
      return 'nested changed too';
    });
  })
);

// or you can just set the value (it cannot be function :) )
subscribers.push(
  state.subscribe('some', (value, eventInfo) => {
    state.update('someOther.nested', 'nested changed too');
);

onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Wildcards

```javascript
import { onDestroy } from "svelte";
import State from "deep-state-observer"; // const State = require('deep-state-observer');

// first parameter is an object that hold the state, and the second one is just options (optional - for now it hold just delimiter :P )
const state = new State({
  some: { thing: { test: 0 } },
  someOther: { nested: { node: "ok" } },
});

// store some unsubscribe methods
let subscribers = [];

subscribers.push(
  state.subscribe("someOther.*.n*e", (value, eventInfo) => {
    // fired only once with
    // value = 'ok'
    // eventInfo.path.resolved = 'someOther.nested.node'
  })
);

// you can update wildcarded values too
state.update("some.*.test", "test");

onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Named wildcards (parameters)

```javascript
import { onDestroy } from "svelte";
import State from "deep-state-observer"; // const State = require('deep-state-observer');

// first parameter is an object that hold the state, and the second one is just options (optional - for now it hold just delimiter :P )
const state = new State({
  items: [{ val: 1 }, { val: 2 }, { val: 3 }],
  byId: {
    1: { val: 1 },
    2: { val: 2 },
    3: { val: 3 },
  },
});

// store some unsubscribe methods
let subscribers = [];

subscribers.push(
  state.subscribe("items.:index.val", (value, eventInfo) => {
    // fired three times
    //
    // #1
    // value = 1
    // eventInfo.path.resolved = 'items.0.val'
    // eventInfo.params = { index: 0 }
    //
    // #2
    // value = 2
    // eventInfo.path.resolved = 'items.1.val'
    // eventInfo.params = { index: 1 }
    //
    // #3
    // value = 3
    // eventInfo.path.resolved = 'items.2.val'
    // eventInfo.params = { index: 2 }
  })
);

subscribers.push(
  state.subscribe("byId.:id.val", (value, eventInfo) => {
    // fired three times
    //
    // #1
    // value = 1
    // eventInfo.path.resolved = 'byId.1.val'
    // eventInfo.params = { id: 1 }
    //
    // #2
    // value = 2
    // eventInfo.path.resolved = 'byId.2.val'
    // eventInfo.params = { id: 2 }
    //
    // #3
    // value = 3
    // eventInfo.path.resolved = 'byId.3.val'
    // eventInfo.params = { id: 3 }
  })
);
onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Wildcard bulk operations (better performance)

```javascript
import { onDestroy } from "svelte";
import State from "deep-state-observer"; // const State = require('deep-state-observer');

// first parameter is an object that hold the state, and the second one is just options (optional - for now it hold just delimiter :P )
const state = new State({
  byId: {
    1: { val: 1 },
    2: { val: 2 },
    3: { val: 3 },
  },
});

// store some unsubscribe methods
let subscribers = [];

subscribers.push(
  state.subscribe(
    "byId.:id.val",
    (bulk, eventInfo) => {
      // fired only once where bulk = [
      //  {
      //    value: 1,
      //    eventInfo.path.resovled: 'byId.1.val',
      //    eventInfo.params: { id: 1 }
      //  },
      //  {
      //    value: 2,
      //    eventInfo.path.resovled: 'byId.2.val',
      //    eventInfo.params: { id: 2 }
      //  },
      //  {
      //    value: 3,
      //    eventInfo.path.resovled: 'byId.3.val',
      //    eventInfo.params: { id: 3 }
      //  },
      // ]
    },
    { bulk: true }
  )
);

subscribers.push(
  state.subscribe(
    "byId.*.val",
    (bulk, eventInfo) => {
      // fired only once where bulk = [
      //  {
      //    value: 1,
      //    eventInfo.path.resolved: 'byId.1.val',
      //    eventInfo.params: undefined
      //  },
      //  {
      //    value: 2,
      //    eventInfo.path.resolved: 'byId.2.val',
      //    eventInfo.params: undefined
      //  },
      //  {
      //    value: 3,
      //    eventInfo.path.resolved: 'byId.3.val',
      //    eventInfo.params: undefined
      //  },
      // ]
    },
    { bulk: true }
  )
);

onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Wildcard bulk without bulk values (even better performance)

```javascript
import { onDestroy } from "svelte";
import State from "deep-state-observer"; // const State = require('deep-state-observer');

// first parameter is an object that hold the state, and the second one is just options (optional - for now it hold just delimiter :P )
const state = new State({
  byId: {
    1: { val: 1 },
    2: { val: 2 },
    3: { val: 3 },
  },
});

// store some unsubscribe methods
let subscribers = [];

subscribers.push(
  state.subscribe(
    "byId.:id.val",
    (bulk, eventInfo) => {
      // fired only once where bulk = [
      //  {
      //    value: undefined,
      //    eventInfo.params: { id: 1 }
      //  },
      //  {
      //    value: undefined,
      //    eventInfo.params: { id: 2 }
      //  },
      //  {
      //    value: 3,
      //    eventInfo.params: { id: 3 }
      //  },
      // ]
    },
    { bulk: true, bulkValue: false }
  )
);

subscribers.push(
  state.subscribe(
    "byId.*.val",
    (bulk, eventInfo) => {
      // fired only once where bulk = [
      //  {
      //    value: undefined,
      //    eventInfo.params: undefined
      //  },
      //  {
      //    value: undefined,
      //    eventInfo.params: undefined
      //  },
      //  {
      //    value: undefined,
      //    eventInfo.params: undefined
      //  },
      // ]
    },
    { bulk: true, bulkValue: false }
  )
);

onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Observe only chosen node changes (not recursive, not nested, for immutable data)

```javascript
import { onDestroy } from "svelte";
import State from "deep-state-observer"; // const State = require('deep-state-observer');

const state = new State({
  some: "value",
  someOther: { nested: { node: "ok" } },
});

// store some unsubscribe methods
let subscribers = [];

subscribers.push(
  state.subscribe("someOther;", (value, eventInfo) => {
    // fired once
    //
    // #1 - immediately with
    // value = { nested: { node: 'ok' } }
    // eventInfo.path.resovled = 'someOther'
  })
);

subscribers.push(
  state.subscribe("someOther.nested;", (value, eventInfo) => {
    // fired once
    //
    // #1 - immediately with
    // value =  { node: 'ok' }
    // eventInfo.path.resolved = 'someOther'
  })
);

state.update("someOther.nested.node", "modified"); // subscribers aren't fired

onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Update and notify only specified listeners

```javascript
const state = new State({
  one: { two: { three: { four: 4 } } },
});
state.subscribe("one.two", (val, eventInfo) => {
  // trigerred only once - immediately
  // because update have option 'only' wich will update only selected nested paths even i you are updating whole 'one.two' object
  // 'only' option works for object and arrays and it is usefull when you have changed only 'four'-th node of the object
  // and don't want to listeners from 'one.two' be notified (it is kind of performance improvement hack)
  // you can bypass those huge operation that is executed here because it is not needed (we are changing only one 'four'th leaf)
});
state.subscribe("one.two.three.four", (val, eventInfo) => {
  // trigerred two times immediately and after update
});
state.update("one.two", { three: { four: 44 } }, { only: ["*.four"] });
```

## mute / unmute changes

It will work with wildcards as update values, as muted paths or both.

```javascript
const state = new State({ x: { z: "z", i: { o: "o" } }, y: "y" });
const values = [];
state.subscribe("x.i.o", (val) => {
  values.push(val);
});
// values.length === 1
state.mute("x.*.o");
state.update("x.i.o", "oo");
// values.length === 1 (x.i.o listener was not fired)
state.unmute("x.*.o");
state.update("x.i.o", "ooo");
// values.length === 2 (x.i.o listener was fired)

state.mute("x");
state.update("x.i.o", "oooo");
// values.length === 2 (x.i.o listener was not fired)

state.unmute("x");
state.mute("x;"); // mute only x (not nested)
state.update("x.i.o", "oooo");
// values.length === 3 (x.i.o listener was fired)
```

You can also mute specific listeners (functions)

```javascript
const state = new State({ x: { z: "z", i: { o: "o" } }, y: "y" });
const values = [];

function listener1() {
  values.push("1");
}
function listener2() {
  values.push("2");
}

state.subscribe("x.i.o", listener1);
state.subscribe("x.i.o", listener2);
// values = ['1', '2']

state.mute(listener2); // from now on listener2 will not fire

values.length = 0;
state.update("x.i.o", "oo");
// values = ['1']

state.unmute(listener2);

values.length = 0;
state.update("x.i.o", "oo");
// values = ['1','2']
```

## ignore

You can watch for object changes but also at the same time ignore specified nodes.
Ignore option will work with wildcards.

```javascript
const state = new State({ one: { two: { three: { four: { five: 0 } } } } });
const values = [];

state.subscribe(
  "one.two.three",
  (val) => {
    values.push(val);
  },
  { ignore: ["one.two.three.four"] }
);
// values.length === 1 & values[0] === { four: { five: 0 } }
state.update("one.two.three.four.five", 1);
// values.length === 1 because all nodes after four was ignored
state.update("one.two.three.*.five", 1);
// values.length === 1 because all nodes after four was ignored
state.update("one.two.three.four", 1);
// values.length === 1 because all nodes after four was ignored
state.update("one.two.*.four", 2);
// values.length === 1 because all nodes after four was ignored
state.update("one.two.three", 1);
// values.length === 1 & values[1] === 1
```

## multi

You can collect updates and execute them at once later - useful when used with groups.

```javascript
const state = new State({
  x: { y: { z: { a: { b: "b" } } } },
  c: { d: { e: "e" } },
});
const values = [];
state.subscribe("x.y.z.a.b", (val, eventInfo) => {
  values.push(val);
});
state.subscribeAll(
  ["x.y.*.a.b", "c.d.e"],
  (val, eventInfo) => {
    values.push("all");
  },
  { group: true }
);
// values.length === 2
// values[0] = 'b'
// values[1] = 'all'

const multi = state.multi(true); // true if you want to execute all changes for specific group only once otherwise each update will cause group to be fired
// from now on collect updates but do not notify any listener yet
multi.update("x.y.z.a.b", "bb");
multi.update("c.d.e", "ee");
// values.length === 2

multi.done(); // notify all listeners about updates - fire only once grouped listeners
// values.length === 4
// values[2] === 'bb'
// values[3] === 'all'
```

## group - very useful if you want to join couple of changes into one

With subscribeAll you can group listeners to fire only once if one of the path is changed.
Grouped listeners always are bulk listeners.

```javascript
const state = new State({
  "n-1": {
    "n-1-1": {
      id: "1-1",
      val: "v1-1",
    },
    "n-1-2": {
      id: "1-2",
      val: "v1-2",
    },
  },
});
const results = [];
function fn(bulk, eventInfo) {
  results.push(eventInfo.path);
}
state.subscribeAll(["n-1.n-1-1.id", "n-1.n-1-2.val"], fn, {
  group: true,
});
// results.length = 1
state.subscribeAll(["n-1"], fn);
// results.length = 2  // not 3
state.update("n-1.*.id", "new id");
// results.length = 4 // not 6
state.update("n-1.*.id", "new id 2");
// results.length = 6 // not 9
```

## collect

You can start collecting changes and execute it as multi later - performance optimization for groups.
It is just global multi.

```javascript
const state = new State({
  x: { y: { z: { a: { b: "b" } } } },
  c: { d: { e: "e" } },
});
const values = [];
state.subscribe("x.y.z.a.b", (val, eventInfo) => {
  values.push(val);
});
state.subscribeAll(
  ["x.y.*.a.b", "c.d.e"],
  (val, eventInfo) => {
    values.push("all");
  },
  { group: true }
);
// values.length === 2
// values[0] = 'b'
// values[1] = 'all'

state.collect(); // from now on collect updates but do not notify any listener yet
state.update("x.y.z.a.b", "bb");
state.update("c.d.e", "ee");
// values.length === 2

state.executeCollected(); // notify all listeners about updates - fire only once grouped listeners
// values.length === 4
// values[2] === 'bb'
// values[3] === 'all'
```

## Trace

You can easily track traces

`state.startTrace(name: string, additionalData: any = null): string` start tracing

`state.stopTrace(id:string): Trace` get current trace

`state.saveTrace(id:string):Trace` save trace on the stack

`state.getSavedTraces(): Trace[]` get all traces from the stack

```javascript
const state = new State({
  p1: "p1v",
  p2: "p2v",
  x1: "x1v",
  x2: "x2v",
});
state.subscribe("p1", (val, eventInfo) => {
  const trackId = state.startTrace("p1", eventInfo);
  state.update("p2", "p2v-");
  state.saveTrace(trackId);
});
state.subscribe("p2", (val, eventInfo) => {
  const trackId = state.startTrace("p2", eventInfo);
  state.update("x2", "x2v-");
  state.saveTrace(trackId);
});
const result = state.getSavedTraces();
console.log(result);
```

## Debug

```javascript
// you can debug listeners and updates with 'debug' and 'source' options
state.subscribe("something", () => {}, {
  debug: true,
  source: "your.component.name.or.something",
});
state.update("something", "someValue", {
  debug: true,
  source: "your.component.name.or.something",
});
```

## Vue example

```javascript
// main component
import State from 'deep-state-observer';

const state = new State({ test: 1 });
const subscribers = [];

export default {
  provide: { state },
};

// child component
export default {
  template: `<div>test is equal to: {{test}}</div>`,
  inject: ['state'],
  data() {
    return {
      test: 0,
    };
  },
  created() {
    subscribers.push(
      this.state.subscribe('test', (test) => {
        this.test = test; // assign to local variable
      })
    );
  },
  beforeDestroy() {
    subscribers.forEach((unsubscribe) => unsubscribe());
  },
};
```
