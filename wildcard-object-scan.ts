import { getWildcardStringMatcher } from 'superwild';

export interface wildcardApi {
  get: (wildcard: string) => {};
}

export interface wildcardResult {
  [key: string]: any;
}

export function match(first, second) {
  return first === second || getWildcardStringMatcher(first)(second);
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
      const currentPath = path === '' ? index.toString() : path + this.delimeter + index;
      if (currentWildcardPath === this.wildcard || match(currentWildcardPath, index.toString())) {
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
    for (const key in currentObj) {
      const currentPath = path === '' ? key : path + this.delimeter + key;
      if (currentWildcardPath === this.wildcard || match(currentWildcardPath, key)) {
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
