export interface wildcardApi {
  get: (wildcardSplit: string | string[]) => {};
}

export interface wildcardResult {
  [key: string]: any;
}

export function wildcardToRegex(wildcard: string, delimeter: string = '.') {
  return new RegExp(
    '^' +
      wildcard
        .split('**')
        .map((part) => {
          return part
            .split('*')
            .map((smallPart) => smallPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join(`[^\\${delimeter}]*`);
        })
        .join(`.*`) +
      '$'
  );
}

export function match(first: string, second: string, delimeter: string = '.'): boolean {
  return wildcardToRegex(first, delimeter).test(second);
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
    const currentWildcardPath = wildcardSplit.slice(0, partIndex + 1).join(delimeter);
    const end = isEnd(wildcardSplit, partIndex);
    const fullWildcard = currentWildcardPath.indexOf('**') > -1;
    const traverse = !end || fullWildcard;
    let index = 0;
    for (const item of currentArr) {
      const currentPath = path === '' ? path + index : path + delimeter + index;
      if (match(currentWildcardPath, currentPath)) {
        if (end) {
          result[currentPath] = item;
        }
        if (traverse) {
          goFurther(wildcardSplit, item, partIndex + 1, currentPath, result);
        }
      } else if (fullWildcard) {
        goFurther(wildcardSplit, item, partIndex + 1, currentPath, result);
      }
      index++;
    }
    return result;
  }

  function handleObject(wildcardSplit: string[], currentObj: any, partIndex: number, path: string, result = {}) {
    const currentWildcardPath = wildcardSplit.slice(0, partIndex + 1).join(delimeter);
    const end = isEnd(wildcardSplit, partIndex);
    const fullWildcard = currentWildcardPath.indexOf('**') > -1;
    const traverse = !end || fullWildcard;
    for (const key in currentObj) {
      const currentPath = path === '' ? path + key : path + delimeter + key;
      if (match(currentWildcardPath, currentPath)) {
        if (end) {
          result[currentPath] = currentObj[key];
        }
        if (traverse) {
          goFurther(wildcardSplit, currentObj[key], partIndex + 1, currentPath, result);
        }
      } else if (fullWildcard) {
        goFurther(wildcardSplit, currentObj[key], partIndex + 1, currentPath, result);
      }
    }
    return result;
  }

  return api;
}
