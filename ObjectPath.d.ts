export default class ObjectPath {
    static get(path: string[], obj: any, create?: boolean): any;
    static _set(path: string[], newValue: any, obj: any, copiedPath?: string[], currentIndex?: number): void;
    static set(path: string[], value: any, obj: any): any;
}
