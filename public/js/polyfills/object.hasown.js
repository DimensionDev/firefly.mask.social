if (!Object.hasOwn) {
  Object.hasOwn = function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
  }
}
