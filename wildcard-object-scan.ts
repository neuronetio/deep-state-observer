import Matcher from './stringMatcher';
export interface wildcardApi {
  get: (wildcard: string) => {};
  match: (first: string, second: string) => boolean;
  simpleMatch: (first: string, second: string) => boolean;
}

export interface wildcardResult {
  [key: string]: any;
}

function WildcardObject(obj: object, delimeter: string, wildcard: string) {
  this.obj = obj;
  this.delimeter = delimeter;
  this.wildcard = wildcard;
}

WildcardObject.prototype.simpleMatch = function simpleMatch(first: string, second: string): boolean {
  if (first === second) return true;
  if (first === this.wildcard) return true;
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
};

WildcardObject.prototype.match = function match(first: string, second: string) {
  return (
    first === second ||
    first === this.wildcard ||
    second === this.wildcard ||
    this.simpleMatch(first, second) ||
    new Matcher(first).match(second)
  );
};

WildcardObject.prototype.handleArray = function handleArray(
  wildcard: string,
  currentArr: any,
  partIndex: number,
  path: string,
  result = {}
) {
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
      this.simpleMatch(currentWildcardPath, key)
    ) {
      end ? (result[currentPath] = item) : this.goFurther(wildcard, item, nextPartIndex + 1, currentPath, result);
    }
    index++;
  }
  return result;
};

WildcardObject.prototype.handleObject = function handleObject(
  wildcard: string,
  currentObj: any,
  partIndex: number,
  path: string,
  result = {}
) {
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
      this.simpleMatch(currentWildcardPath, key)
    ) {
      end
        ? (result[currentPath] = currentObj[key])
        : this.goFurther(wildcard, currentObj[key], nextPartIndex + 1, currentPath, result);
    }
  }
  return result;
};

WildcardObject.prototype.goFurther = function goFurther(
  wildcard: string,
  currentObj,
  partIndex: number,
  currentPath: string,
  result = {}
) {
  if (Array.isArray(currentObj)) {
    return this.handleArray(wildcard, currentObj, partIndex, currentPath, result);
  }
  return this.handleObject(wildcard, currentObj, partIndex, currentPath, result);
};

WildcardObject.prototype.get = function get(wildcard: string): any {
  return this.goFurther(wildcard, this.obj, 0, '');
};

export default WildcardObject;
