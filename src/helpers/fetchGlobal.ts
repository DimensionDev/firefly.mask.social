import { fetch } from '@/helpers/fetch.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchGlobal(
    input: RequestInfo,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Response> {
    return fetch(input, init, options);
}
