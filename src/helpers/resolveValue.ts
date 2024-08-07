export function resolveValue<T>(value: T | (() => T)): T {
    if (typeof value === 'function') {
        const callback = value as () => T;
        return callback();
    }
    return value;
}
