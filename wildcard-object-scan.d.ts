export interface wildcardApi {
    get: (wildcard: string) => {};
    match: (first: string, second: string) => boolean;
    simpleMatch: (first: string, second: string) => boolean;
}
export interface wildcardResult {
    [key: string]: any;
}
declare function WildcardObject<T>(obj: T | object, delimiter: string, wildcard: string, is_match?: (first: string, second: string) => boolean): void;
export default WildcardObject;
