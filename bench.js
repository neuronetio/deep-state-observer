const Benchmark = require('benchmark');
const DeepState = require('./index.cjs.js');

const width = 10;
const height = 10000;
const subs = 1000;

function getObj() {
  const obj = {};
  for (let h = 0; h < height; h++) {
    const current = {};
    for (let w = 0; w < width; w++) {
      current['w' + w] = `${h} ${w}`;
    }
    obj['h' + h] = current;
  }
  return obj;
}

const item = `h${Math.round(height / 2)}.w${Math.round(width / 2)}`;
const wild = `h${Math.round(height / 2)}.*${Math.round(width / 2)}`;

function generateSubs(state) {
  for (let i = 0; i < subs; i++) {
    state.subscribe(wild, () => {
      const x = 1 + Math.random();
    });
    state.subscribe(item, () => {
      const x = 1 + Math.random();
    });
  }
}

const state = new Array(2);

const objs = [getObj(), getObj()];

state[0] = new DeepState(objs[0], { useCache: false });
generateSubs(state[0]);
state[1] = new DeepState(objs[1], { useCache: true });
generateSubs(state[1]);

console.log('update & get');
new Benchmark.Suite('update get')
  .add('[no cache]', function () {
    state[0].update(item, { val: Math.random() });
    state[0].get(wild);
  })
  .add('[cache]', function () {
    state[1].update(item, 2);
    state[1].get(wild);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log(`Fastest is '${this.filter('fastest').map('name')}'`);
  })
  .run();

console.log('update');
new Benchmark.Suite('update')
  .add('[no cache]', function () {
    state[0].update(item, { val: Math.random() });
  })
  .add('[cache]', function () {
    state[1].update(item, { val: Math.random() });
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log(`Fastest is '${this.filter('fastest').map('name')}'`);
  })
  .run();

console.log('get');
new Benchmark.Suite('get')
  .add('[no cache]', function () {
    state[0].get(wild);
  })
  .add('[cache]', function () {
    state[1].get(wild);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log(`Fastest is '${this.filter('fastest').map('name')}'`);
  })
  .run();
