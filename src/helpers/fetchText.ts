import { fetch } from '@/helpers/fetch.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchText(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<string> {
    const response = await fetch(input, init, options);
    return response.text();
}
