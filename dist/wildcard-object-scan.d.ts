export interface wildcardResult {
    [key: string]: any;
}
declare class WildcardObject {
    private obj;
    private delimiter;
    private wildcard;
    private is_match;
    constructor(obj: object, delimiter: string, wildcard: string, is_match?: (first: string, second: string) => boolean);
    shortMatch(first: string, second: string): boolean;
    match(first: string, second: string): any;
    handleArray(wildcard: string, currentArr: any, partIndex: number, path: string, result?: {}): {};
    handleObject(wildcardPath: string, currentObj: any, partIndex: number, path: string, result?: {}): {};
    goFurther(path: string, currentObj: any, partIndex: number, currentPath: string, result?: {}): {};
    get(path: string): any;
}
export default WildcardObject;
