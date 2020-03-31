export default class ObjectPath {
    static get(path: string[], obj: any, copiedPath?: string[]): any;
    static set(path: string[], newValue: any, obj: any, copiedPath?: string[]): void;
}
