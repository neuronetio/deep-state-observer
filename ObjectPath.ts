export default class ObjectPath {
  static get(path: string[], obj, create = false) {
    if (!obj) return;
    let currObj = obj;
    for (const currentPath of path) {
      if (currObj.hasOwnProperty(currentPath)) {
        currObj = currObj[currentPath];
      } else if (create) {
        currObj[currentPath] = {};
        currObj = currObj[currentPath];
      } else {
        return;
      }
    }
    return currObj;
  }

  static set(path: string[], value, obj) {
    if (!obj) return;
    if (path.length === 0) {
      for (const key in value) {
        obj[key] = value[key];
      }
      return;
    }
    const prePath = path.slice();
    const lastPath = prePath.pop();
    const get = ObjectPath.get(prePath, obj, true);
    if (typeof get === 'object') {
      get[lastPath] = value;
    }
    return value;
  }
}
