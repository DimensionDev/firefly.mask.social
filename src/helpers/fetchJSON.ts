import { isServer } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { fetch } from '@/helpers/fetch.js';
import { Duration } from '@/helpers/fetchCached.js';
import { Expiration } from '@/helpers/fetchSquashed.js';
import { getNextFetchers, type NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    const { noDefaultContentType = false } = options ?? {};
    const url = typeof input === 'string' && input.startsWith('/') && isServer ? urlcat(SITE_URL, input) : input;

    const response = await fetch(
        url,
        {
            ...init,
            headers: noDefaultContentType
                ? init?.headers
                : {
                      'Content-Type': 'application/json',
                      ...init?.headers,
                  },
        },
        getNextFetchers(options),
    );
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
