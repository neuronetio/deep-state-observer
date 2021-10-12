import { Match } from "./stringMatcher";
export interface wildcardResult {
  [key: string]: any;
}

class WildcardObject {
  private obj;
  private delimiter;
  private wildcard;
  private is_match;
  private objectMap: Map<string, any> = null;

  constructor(
    obj: object,
    delimiter: string,
    wildcard: string,
    objectMap: Map<string, any> = null,
    is_match: (first: string, second: string) => boolean = undefined
  ) {
    this.obj = obj;
    this.delimiter = delimiter;
    this.wildcard = wildcard;
    this.is_match = is_match;
    this.objectMap = objectMap;
  }

  shortMatch(first: string, second: string): boolean {
    if (first === second) return true;
    if (first === this.wildcard) return true;
    if (this.is_match) return this.is_match(first, second);
    const index = first.indexOf(this.wildcard);
    if (index > -1) {
      const end = first.substr(index + 1);
      if (index === 0 || second.substring(0, index) === first.substring(0, index)) {
        const len = end.length;
        if (len > 0) {
          return second.substr(-len) === end;
        }
        return true;
      }
    }
    return false;
  }

  match(first: string, second: string) {
    if (this.is_match) return this.is_match(first, second);
    return (
      first === second ||
      first === this.wildcard ||
      second === this.wildcard ||
      this.shortMatch(first, second) ||
      Match(first, second, this.wildcard)
    );
  }

  handleArray(wildcard: string, currentArr: any, partIndex: number, path: string, result = {}) {
    let nextPartIndex = wildcard.indexOf(this.delimiter, partIndex);
    let end = false;
    if (nextPartIndex === -1) {
      end = true;
      nextPartIndex = wildcard.length;
    }
    const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
    let index = 0;
    for (const item of currentArr) {
      const key = index.toString();
      const currentPath = path === "" ? key : path + this.delimiter + index;
      if (
        currentWildcardPath === this.wildcard ||
        currentWildcardPath === key ||
        this.shortMatch(currentWildcardPath, key)
      ) {
        end ? (result[currentPath] = item) : this.goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
      }
      index++;
    }
    return result;
  }

  handleObject(wildcardPath: string, currentObj: any, partIndex: number, path: string, result = {}) {
    let nextPartIndex = wildcardPath.indexOf(this.delimiter, partIndex);
    let end = false;
    if (nextPartIndex === -1) {
      end = true;
      nextPartIndex = wildcardPath.length;
    }
    const currentWildcardPath = wildcardPath.substring(partIndex, nextPartIndex);
    for (let key in currentObj) {
      key = key.toString();
      const currentPath = path === "" ? key : path + this.delimiter + key;
      if (
        currentWildcardPath === this.wildcard ||
        currentWildcardPath === key ||
        this.shortMatch(currentWildcardPath, key)
      ) {
        if (end) {
          result[currentPath] = currentObj[key];
        } else {
          this.goFurther(wildcardPath, currentObj[key], nextPartIndex + 1, currentPath, result);
        }
      }
    }
    return result;
  }

  goFurther(path: string, currentObj, partIndex: number, currentPath: string, result = {}) {
    if (Array.isArray(currentObj)) {
      return this.handleArray(path, currentObj, partIndex, currentPath, result);
    }
    return this.handleObject(path, currentObj, partIndex, currentPath, result);
  }

  private getIndicesCount(searchStr: string, str: string): number {
    const searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return 0;
    }
    let startIndex = 0,
      index,
      indices = 0;
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices++;
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  getFromMap(path: string) {
    const result = {};
    const pathDelimitersCount = this.getIndicesCount(this.delimiter, path);
    const len = path.length;
    for (const [key, value] of this.objectMap) {
      if (this.getIndicesCount(this.delimiter, key) === pathDelimitersCount && this.match(path, key)) {
        result[key] = value;
      }
    }
    return result;
  }

  get(path: string): any {
    if (this.objectMap) {
      return this.getFromMap(path);
    }
    return this.goFurther(path, this.obj, 0, "");
  }
}

export default WildcardObject;
