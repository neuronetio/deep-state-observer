import DeepStateObserver from "./index";

export interface Zobj {
  d: number;
  e: string;
}

export interface Yobj {
  a: number;
  b: string;
  c: Zobj;
}

export interface SomeState {
  x: number;
  y: Yobj;
}

const someState: SomeState = {
  x: 10,
  y: {
    a: 1,
    b: "2",
    c: {
      d: 3,
      e: "4",
    },
  },
};

const state = new DeepStateObserver<SomeState>(someState);

state.$$$.y.c.d = 33;

if (state.get("y.c.d") !== 33) {
  console.error("wrong");
} else {
  console.log("ok");
}
