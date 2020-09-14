const State = require('./index.cjs.js');

let dataItemsCount = 50000;
let iterations = 1;

if (process.argv.length > 2) {
  dataItemsCount = parseInt(process.argv[2]);
}
if (process.argv.length > 3) {
  iterations = parent(process.argv[3]);
}

console.log(`Data item count: ${dataItemsCount}. Iterations: ${iterations}.`);

function prepareData() {
  const data = {
    nested: {
      values: {
        basic: { data: {} },
      },
    },
  };
  for (let i = 0; i < dataItemsCount; i++) {
    data.nested.values.basic.data[i] = {
      id: i,
      value: i + ' test',
    };
  }
  return data;
}

const state = new State(prepareData());

console.log('Data generated.');

const times = {
  basic: {
    update: [],
    subscribe: [],
    large: [],
  },
};

let t1 = Date.now();
const basic = state.subscribe('nested.*.basic.data.*.value', (value) => {});
for (let i = 0; i < iterations; i++) {
  const time = { start: Date.now() };
  state.update(
    `nested.*.basic.data.${Math.round(Math.random() * dataItemsCount)}.value`,
    () => i + ' mod'
  );
  time.end = Date.now();
  time.result = time.end - time.start;
  times.basic.update.push(time);
}
basic();

let regular = (Date.now() - t1) / iterations;
console.log(`Regular time: ${regular}`);

const basicResult = {
  update: 0,
  subscribe: 0,
  large: 0,
};
times.basic.update.forEach((time) => (basicResult.update += time.result));
let result = Math.round((basicResult.update / iterations + regular) / 2);
console.log(`basic.update average result: ${result}`);

// ---------------------------
t1 = Date.now();
const large = state.subscribe(
  'nested.values.basic.data.*.value',
  (value) => {}
);
for (let i = 0; i < iterations; i++) {
  const time = { start: Date.now() };
  state.update(
    `nested.values.basic.data`,
    (data) => {
      for (const key in data) {
        data[key].value = 'mod';
      }
      return data;
    },
    { only: ['value'] }
  );
  time.end = Date.now();
  time.result = time.end - time.start;
  times.basic.large.push(time);
}
large();

regular = (Date.now() - t1) / iterations;
console.log(`Update large time: ${regular}`);

times.basic.large.forEach((time) => (basicResult.large += time.result));
result = Math.round((basicResult.large / iterations + regular) / 2);
console.log(`basic.large average result: ${result}`);

// ---------------------------

const subscribers = [];
t1 = Date.now();
for (let i = 0; i < iterations; i++) {
  subscribers.push(
    state.subscribe('nested.*.basic.data.*.value', (value) => {})
  );
  const time = { start: Date.now() };
  state.update(
    `nested.*.basic.data.${Math.round(Math.random() * dataItemsCount)}.value`,
    () => i + ' mod'
  );
  time.end = Date.now();
  time.result = time.end - time.start;
  times.basic.subscribe.push(time);
}
subscribers.forEach((destroy) => destroy());
regular = (Date.now() - t1) / iterations;
result = Math.round((basicResult.update / iterations + regular) / 2);
console.log(`Regular time: ${regular}`);
times.basic.subscribe.forEach((time) => (basicResult.subscribe += time.result));
console.log(`basic.subscribe average result: ${result}`);
