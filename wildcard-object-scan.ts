import { getWildcardStringMatcher } from 'superwild';
export interface wildcardApi {
  get: (wildcard: string) => {};
}

export interface wildcardResult {
  [key: string]: any;
}

export function simpleMatch(first: string, second: string): boolean {
  if (first === second) return true;
  if (first === '*') return true;
  const index = first.indexOf('*');
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

export function match(first: string, second: string) {
  return (
    first === second ||
    first === '*' ||
    second === '*' ||
    simpleMatch(first, second) ||
    getWildcardStringMatcher(first)(second)
  );
}

export const WildcardObject = class WildcardObject {
  private obj: any;
  private delimeter: string;
  private wildcard: string;

  constructor(obj, delimeter, wildcard) {
    this.obj = obj;
    this.delimeter = delimeter;
    this.wildcard = wildcard;
  }

  private handleArray(wildcard: string, currentArr: any, partIndex: number, path: string, result = {}) {
    let nextPartIndex = wildcard.indexOf(this.delimeter, partIndex);
    let end = false;
    if (nextPartIndex === -1) {
      end = true;
      nextPartIndex = wildcard.length;
    }
    const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
    let index = 0;
    for (const item of currentArr) {
      const key = index.toString();
      const currentPath = path === '' ? key : path + this.delimeter + index;
      if (
        currentWildcardPath === this.wildcard ||
        currentWildcardPath === key ||
        simpleMatch(currentWildcardPath, key)
      ) {
        end ? (result[currentPath] = item) : this.goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
      }
      index++;
    }
    return result;
  }

  private handleObject(wildcard: string, currentObj: any, partIndex: number, path: string, result = {}) {
    let nextPartIndex = wildcard.indexOf(this.delimeter, partIndex);
    let end = false;
    if (nextPartIndex === -1) {
      end = true;
      nextPartIndex = wildcard.length;
    }
    const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
    for (let key in currentObj) {
      key = key.toString();
      const currentPath = path === '' ? key : path + this.delimeter + key;
      if (
        currentWildcardPath === this.wildcard ||
        currentWildcardPath === key ||
        simpleMatch(currentWildcardPath, key)
      ) {
        end
          ? (result[currentPath] = currentObj[key])
          : this.goFurther(wildcard, currentObj[key], nextPartIndex + 1, currentPath, result);
      }
    }
    return result;
  }

  private goFurther(wildcard: string, currentObj, partIndex: number, currentPath: string, result = {}) {
    if (Array.isArray(currentObj)) {
      return this.handleArray(wildcard, currentObj, partIndex, currentPath, result);
    }
    return this.handleObject(wildcard, currentObj, partIndex, currentPath, result);
  }

  public get(wildcard: string): any {
    return this.goFurther(wildcard, this.obj, 0, '');
  }
};

export default { WildcardObject, match };
