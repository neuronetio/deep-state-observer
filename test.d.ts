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
