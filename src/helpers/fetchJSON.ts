import { fetch } from '@/helpers/fetch.js';
import { Duration } from '@/helpers/fetchCached.js';
import { Expiration } from '@/helpers/fetchSquashed.js';
import { getNextFetchers, type NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    const response = await fetch(
        input,
        {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...init?.headers,
            },
        },
        getNextFetchers(options),
    );
    if (options?.throwIfNotOK && !response.ok) throw new Error('Failed to fetch JSON.');
    return response.json();
}

export async function fetchSquashedJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    return fetchJSON<T>(input, init, {
        squashExpiration: Expiration.ONE_SECOND,
        ...options,
    });
}

export async function fetchCachedJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    return fetchJSON<T>(input, init, {
        squashExpiration: Expiration.ONE_SECOND,
        cacheDuration: Duration.ONE_MINUTE,
        ...options,
    });
}
