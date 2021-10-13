import DeepStateObserver from "./index";

const width = 5;
const height = 5;
const subs = 10;

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

const item = `h${Math.round(height / 2)}.w${Math.round(width / 2)}`;
console.log("item", item);
function generateSubs(state) {
  for (let i = 0; i < subs; i++) {
    state.subscribe(item, () => {
      const x = 1 + Math.random();
    });
  }
}

const state = new DeepStateObserver(getObj());
generateSubs(state);
console.log(state.get(""));

state.update(item, { xxx: 1010 });
