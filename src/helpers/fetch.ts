import { FetchError } from '@/constants/error.js';
import { getNextFetchers, type NextFetchersOptions } from '@/helpers/getNextFetchers.js';

const { fetch: originalFetch } = globalThis;

export type Fetcher<T = Response> = (input: RequestInfo | URL, init?: RequestInit, next?: Fetcher) => Promise<T>;

export async function fetch(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Response> {
    const fetcher = getNextFetchers(options).reduceRight<Fetcher>(
        (ff, f) => (r, i) => f(r, i, ff),
        (input: RequestInfo | URL, init?: RequestInit | undefined) => {
            return originalFetch(input, {
                signal: AbortSignal.timeout(3 * 60 * 1000 /* 3 mins */),
                ...init,
            });
        },
    );

    const response = await fetcher(input, init);

    if (!response.ok && !options?.noDefaultContentType) {
        const fetchError = await FetchError.from(input, response);
        fetchError.toThrow();
    }
    return response;
}
