export type DeferTuple<T, E = unknown> = [Promise<T>, (value: T | PromiseLike<T>) => void, (reason: E) => void];

export function defer<T, E = unknown>(): DeferTuple<T, E> {
    let a!: (val: T | PromiseLike<T>) => void, b!: (err: E) => void;
    const p = new Promise<T>((x, y) => {
        a = x;
        b = y;
    });
    return [p, a, b];
}
