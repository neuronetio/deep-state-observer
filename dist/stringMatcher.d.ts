declare class Matcher {
    private wchar;
    private pattern;
    private segments;
    private starCount;
    private minLength;
    private maxLength;
    private segStartIndex;
    constructor(pattern: string, wchar?: string);
    match(match: string): boolean;
}
export default Matcher;
export declare function Match(pattern: string, match: string, wchar?: string): boolean;
