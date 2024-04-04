type Func<T extends any[], R> = (...args: T) => Promise<R>;

interface Options<T extends any[]> {
    resolver?: (...args: T) => string;
}

export function once<T extends any[], R>(fn: Func<T, R>, options: Options<T> = {}): Func<T, R> {
    const running = new Set<string>();

    return async function (...args: T): Promise<R> {
        const { resolver } = options;
        const key = resolver ? resolver(...args) : args.join('_');

        if (running.has(key)) {
            throw new Error(`Function with key '${key}' is still running`);
        }

        try {
            running.add(key);
            return await fn(...args);
        } finally {
            running.delete(key);
        }
    };
}
