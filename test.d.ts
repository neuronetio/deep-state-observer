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
