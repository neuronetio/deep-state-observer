import * as path from "path";
import DeepStateObserver from "./index";

export interface Zobj {
  d: number;
  e: string;
}

export interface Yobj {
  a: number;
  b: string;
  c: Zobj;
  d: Zobj;
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
    d: {
      d: 4,
      e: "55",
    },
  },
};

const state = new DeepStateObserver<SomeState>(someState);

state.subscribe("y.c.d", (v) => {}, { bulk: true });

state.$$$.y.c.d = 33;

if (state.get("y.c.d") !== 33) {
  console.error("wrong");
} else {
  console.log("ok");
}
type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

declare function get<P extends Path<SomeState>>(path: P): PathValue<SomeState, P>;

declare function sub<P extends Path<SomeState>>(path: P, callback: (val: PathValue<SomeState, P>) => void): void;

sub("y.c.d", (val) => {});

const v = get("y.c.e");
