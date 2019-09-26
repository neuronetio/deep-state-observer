import { getWildcardStringMatcher } from 'superwild';

export interface wildcardApi {
  get: (wildcardSplit: string | string[]) => {};
}

export interface wildcardResult {
  [key: string]: any;
}

export function match(first, second) {
  return first === second || getWildcardStringMatcher(first)(second);
}

export function scanObject(obj: any, delimeter: string = '.'): wildcardApi {
  const api = {
    get(wildcard: string | string[]): any {
      const wildcardSplit = prepareWildcardSplit(wildcard);
      if (wildcardSplit.length === 0) {
        return obj;
      }
      return handleObject(wildcardSplit, obj, 0, '');
    }
  };

  function prepareWildcardSplit(wildcardSplit: string | string[]): string[] {
    if (typeof wildcardSplit === 'string') {
      if (wildcardSplit === '') {
        wildcardSplit = [];
      } else {
        wildcardSplit = wildcardSplit.split(delimeter);
      }
    }
    return wildcardSplit;
  }

  function isEnd(wildcardSplit: string[], partIndex: number): boolean {
    return wildcardSplit.length - 1 <= partIndex;
  }

  function goFurther(wildcardSplit, currentObj, partIndex, currentPath, result) {
    if (Array.isArray(currentObj)) {
      handleArray(wildcardSplit, currentObj, partIndex, currentPath, result);
    } else if (currentObj.constructor.name === 'Object') {
      handleObject(wildcardSplit, currentObj, partIndex, currentPath, result);
    }
  }

  function handleArray(wildcardSplit: string[], currentArr: any, partIndex: number, path: string, result = {}) {
    const currentWildcardPath = wildcardSplit.slice(partIndex, partIndex + 1).join(delimeter);
    const end = isEnd(wildcardSplit, partIndex);
    let index = 0;
    for (const item of currentArr) {
      const currentPath = path === '' ? index.toString() : path + delimeter + index;
      if (currentWildcardPath.endsWith('*') || match(currentWildcardPath, currentPath)) {
        if (end) {
          result[currentPath] = item;
        } else {
          goFurther(wildcardSplit, item, partIndex + 1, currentPath, result);
        }
      }
      index++;
    }
    return result;
  }

  function handleObject(wildcardSplit: string[], currentObj: any, partIndex: number, path: string, result = {}) {
    const currentWildcardPath = wildcardSplit.slice(partIndex, partIndex + 1).join(delimeter);
    const end = isEnd(wildcardSplit, partIndex);
    for (const key in currentObj) {
      const currentPath = path === '' ? key : path + delimeter + key;
      if (currentWildcardPath.endsWith('*') || match(currentWildcardPath, key)) {
        if (end) {
          result[currentPath] = currentObj[key];
        } else {
          goFurther(wildcardSplit, currentObj[key], partIndex + 1, currentPath, result);
        }
      }
    }
    return result;
  }

  return api;
}

export default { scanObject, match };
