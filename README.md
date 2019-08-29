[![GitHub license](https://img.shields.io/github/license/neuronetio/deep-state-observer?style=flat-square)](https://github.com/neuronetio/deep-state-observer/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/neuronetio/deep-state-observer)](https://github.com/neuronetio/deep-state-observer/issues)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/neuronetio/deep-state-observer)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fneuronetio%2Fdeep-state-observer)

# deep-state-observer

Deep state observer is an state management library which will be fired only when specified object node was changed.
You don't need to reevaluate or re-render whole app/component when only one portion of the state was modified.
Deep state observer is framework agnostic with node and browser support, so you can use it in most of your projects.

# Usage

## Svelte example

```javascript
import { onDestroy } from 'svelte';
import Store from 'deep-state-observer'; // const {Store} = require('deep-state-observer');

// first parameter is an object that hold the state, and the second one is just options (optional - for now it hold just delimeter :P )
const state = new Store({ some: 'value', someOther: { nested: 'value' } }, { delimeter:'.' });

// store some unsubscribe methods
let subscribers = [];

// change local variable - it can be vueComponent.data property or react function with setState in react
let nestedValue;
subscribers.push(
  state.subscribe('someOther.nested', (value) => {
    nestedValue = value;
  })
);

let some;
subscribers.push(
  state.subscribeAll(['some', 'someOther'], (which, value) => {
    if (which === 'some') {
      some = value;
    } else if (which === 'someOther') {
      nestedValue = value.nested;
    }
  })
);

state.update('someOther.nested', (currentValue) => {
  return 'new value';
});

// you can use function to modify data
subscribers.push(
  state.subscribe('some', (value) => {
    state.update('someOther.nested', (oldValue) => {
      return 'nested changed after some changed';
    });
  })
);

// or you can just set the value (it cannot be function :) )
subscribers.push(
  state.subscribe('some', (value) => {
    state.update('someOther.nested', 'nested changed after some changed');
);

// you can also use wildcards!! :O
subscribers.push(
  state.subscribe('someOther.**', value=>{
    console.log(value);
  })
);

subscribers.push(
  state.subscribe('some*.*.bla*.*bla*.bla', value=>{
    console.log(value);
  })
);

let currentState = state.get();
console.log(currentState.some); //-> { some: 'value', someOther: { nested: 'new value' } }

onDestroy(() => {
  subscribers.forEach((unsubscribe) => unsubscribe());
});
```

## Vue example

```javascript
// main component
import Store from 'deep-state-observer';

const state = new Store({ test: 1 });
const subscribers = [];

export default {
  provide: { state }
};

// child component
export default {
  template:`<div>test is equal to: {{test}}</div>`,
  inject:['state'],
  data(){
    return {
      test: 0
    };
  },
  created(){
    subscribers.push(
      this.state.subscribe('test', test =>{
        this.test = test; // assign to local variable
      })
    );
  },
  beforeDestroy(){
    subscribers.forEach(unsubscribe=>unsubscribe());
  }
}
```
