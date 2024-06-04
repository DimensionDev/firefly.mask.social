if (!Object.hasOwn) {
    Object.hasOwn = function hasOwn(obj, key) {
        // eslint-disable-next-line prefer-object-has-own
        return Object.prototype.hasOwnProperty.call(obj, key);
    };
}
