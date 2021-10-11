export interface wildcardResult {
    [key: string]: any;
}
declare class WildcardObject<T> {
    private obj;
    private delimiter;
    private wildcard;
    private is_match;
    private objectMap;
    constructor(obj: T | object, delimiter: string, wildcard: string, objectMap?: Map<string, any>, is_match?: (first: string, second: string) => boolean);
    shortMatch(first: string, second: string): boolean;
    match(first: string, second: string): any;
    handleArray(wildcard: string, currentArr: any, partIndex: number, path: string, result?: {}): {};
    handleObject(wildcardPath: string, currentObj: any, partIndex: number, path: string, result?: {}): {};
    goFurther(path: string, currentObj: any, partIndex: number, currentPath: string, result?: {}): {};
    private getIndicesCount;
    getFromMap(path: string): {};
    get(path: string): any;
}
export default WildcardObject;
