import { getWildcardStringMatcher } from 'superwild';

export interface wildcardApi {
  get: (wildcard: string) => {};
}

export interface wildcardResult {
  [key: string]: any;
}

const cache = {};

export function match(first, second) {
  return first === second || getWildcardStringMatcher(first)(second);
}

function goFurther(wildcard: string, currentObj, partIndex: number, currentPath: string, result = {}, delimeter = '.') {
  if (Array.isArray(currentObj)) {
    return handleArray(wildcard, currentObj, partIndex, currentPath, result);
  } else if (currentObj.constructor.name === 'Object') {
    return handleObject(wildcard, currentObj, partIndex, currentPath, result);
  }
}

function handleArray(
  wildcard: string,
  currentArr: any,
  partIndex: number,
  path: string,
  result = {},
  delimeter: string = '.'
) {
  let nextPartIndex = wildcard.indexOf(delimeter, partIndex);
  let end = false;
  if (nextPartIndex === -1) {
    end = true;
    nextPartIndex = wildcard.length;
  }
  const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
  let index = 0;
  for (const item of currentArr) {
    const currentPath = path === `` ? index.toString() : `${path}${delimeter}${index}`;
    if (currentWildcardPath === `*` || match(currentWildcardPath, index.toString())) {
      end ? (result[currentPath] = item) : goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
    }
    index++;
  }
  return result;
}

function handleObject(
  wildcard: string,
  currentObj: any,
  partIndex: number,
  path: string,
  result = {},
  delimeter: string = '.'
) {
  let nextPartIndex = wildcard.indexOf(delimeter, partIndex);
  let end = false;
  if (nextPartIndex === -1) {
    end = true;
    nextPartIndex = wildcard.length;
  }
  const currentWildcardPath = wildcard.substring(partIndex, nextPartIndex);
  for (const key in currentObj) {
    const currentPath = path === `` ? key : `${path}${delimeter}${key}`;
    if (currentWildcardPath === `*` || match(currentWildcardPath, key)) {
      end
        ? (result[currentPath] = currentObj[key])
        : goFurther(wildcard, currentObj[key], nextPartIndex + 1, currentPath, result);
    }
  }
  return result;
}

export function scanObject(obj: any, delimeter: string = '.'): wildcardApi {
  return {
    get(wildcard: string): any {
      return goFurther(wildcard, obj, 0, '', {}, delimeter);
    }
  };
}

export default { scanObject, match };
