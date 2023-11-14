import { fetch } from '@/helpers/fetch.js';
import { type NextFetchersOptions, getNextFetchers } from '@/helpers/getNextFetchers.js';

export async function fetchText(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<string> {
    const response = await fetch(input, init, getNextFetchers(options));
    if (!response.ok) throw new Error('Failed to fetch as Text.');
    return response.text();
}
