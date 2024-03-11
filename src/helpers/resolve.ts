export function resolve<T>(callback: () => T): T {
    return callback();
}
