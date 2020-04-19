export default class ObjectPath {
    static get(path: string[], obj: any, create?: boolean): any;
    static set(path: string[], value: any, obj: any): any;
}
