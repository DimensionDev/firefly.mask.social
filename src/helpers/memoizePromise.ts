import { memoize } from 'lodash-es';

/**
 * The promise version of lodash-es/memoize
 * @param f An async function
 * @param resolver A function used to map the param the memoize key.
 */
export function memoizePromise<T extends (...args: any[]) => Promise<any>>(
    f: T,
    resolver: (...args: Parameters<T>) => string,
) {
    const memorizedFunction = memoize(
        async function (...args: unknown[]) {
            try {
                // ? DO NOT remove "await" here
                return await f(...args);
            } catch (error) {
                memorizedFunction.cache.delete(resolver(...(args as Parameters<T>)));
                throw error;
            }
        } as T,
        resolver,
    );
    return memorizedFunction as T;
}
