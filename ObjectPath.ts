export default class ObjectPath {
  static get(path: string[], obj, copiedPath: string[] = null) {
    if (copiedPath === null) {
      copiedPath = path.slice();
    }
    if (copiedPath.length === 0 || typeof obj === "undefined") {
      return obj;
    }
    const currentPath = copiedPath.shift();
    if (!obj.hasOwnProperty(currentPath)) {
      return undefined;
    }
    if (copiedPath.length === 0) {
      return obj[currentPath];
    }
    return ObjectPath.get(path, obj[currentPath], copiedPath);
  }

  static set(path: string[], newValue, obj, copiedPath: string[] = null) {
    if (copiedPath === null) {
      copiedPath = path.slice();
    }
    if (copiedPath.length === 0) {
      for (const key in obj) {
        delete obj[key];
      }
      for (const key in newValue) {
        obj[key] = newValue[key];
      }
      return;
    }
    const currentPath = copiedPath.shift();
    if (copiedPath.length === 0) {
      obj[currentPath] = newValue;
      return;
    }
    if (!obj) {
      obj = {};
    }
    if (!obj.hasOwnProperty(currentPath)) {
      obj[currentPath] = {};
    }
    ObjectPath.set(path, newValue, obj[currentPath], copiedPath);
  }
}
