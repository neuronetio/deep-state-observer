export interface wildcardApi {
    get: (wildcard: string) => {};
    match: (first: string, second: string) => boolean;
    simpleMatch: (first: string, second: string) => boolean;
}
export interface wildcardResult {
    [key: string]: any;
}
declare function WildcardObject(obj: object, delimeter: string, wildcard: string): void;
export default WildcardObject;
