if (!Object.hasOwn) {
    console.info('[polyfill Object.hasOwn]: created');

    Object.hasOwn = (obj, key) => {
        // eslint-disable-next-line prefer-object-has-own
        return Object.prototype.hasOwnProperty.call(obj, key);
    };
}
