const Benchmark = require("benchmark");
const State = require("./index.cjs.js");

const width = 10;
const height = 1000;

function getObj() {
  const obj = {};
  for (let h = 0; h < height; h++) {
    const current = {};
    for (let w = 0; w < width; w++) {
      current["w" + w] = `${h} ${w}`;
    }
    obj["h" + h] = current;
  }
  return obj;
}

const noProxyNoMaps = new State(getObj(), { useProxy: false, useObjectMaps: false });
const ProxyNoMaps = new State(getObj(), { useProxy: true, useObjectMaps: false });
const noProxyMaps = new State(getObj(), { useProxy: false, useObjectMaps: true });
const ProxyMaps = new State(getObj(), { useProxy: true, useObjectMaps: true });

const item = `h${Math.round(height / 2)}.w${Math.round(width / 2)}`;

console.log("update & get");
new Benchmark.Suite("update get")
  .add("no proxy no maps", function () {
    noProxyNoMaps.update(item, 2);
    noProxyNoMaps.get(item);
  })
  .add("proxy no maps", function () {
    ProxyNoMaps.update(item, 2);
    ProxyNoMaps.get(item);
  })
  .add("no proxy with maps", function () {
    noProxyMaps.update(item, 2);
    noProxyMaps.get(item);
  })
  .add("proxy & maps", function (event) {
    ProxyMaps.update(item, 2);
    ProxyMaps.get(item);
  })
  .on("cycle", function (event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log(`Fastest is '${this.filter("fastest").map("name")}'`);
  })
  .run();

console.log("update");
new Benchmark.Suite("update")
  .add("no proxy no maps", function () {
    noProxyNoMaps.update(item, 2);
  })
  .add("proxy no maps", function () {
    ProxyNoMaps.update(item, 2);
  })
  .add("no proxy with maps", function () {
    noProxyMaps.update(item, 2);
  })
  .add("proxy & maps", function (event) {
    ProxyMaps.update(item, 2);
  })
  .on("cycle", function (event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log(`Fastest is '${this.filter("fastest").map("name")}'`);
  })
  .run();

console.log("get");
new Benchmark.Suite("get")
  .add("no proxy no maps", function () {
    noProxyNoMaps.get(item);
  })
  .add("proxy no maps", function () {
    ProxyNoMaps.get(item);
  })
  .add("no proxy with maps", function () {
    noProxyMaps.get(item);
  })
  .add("proxy & maps", function (event) {
    ProxyMaps.get(item);
  })
  .on("cycle", function (event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log(`Fastest is '${this.filter("fastest").map("name")}'`);
  })
  .run();
