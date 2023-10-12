import { fetch } from '@/helpers/fetch';
import { NextFetchersOptions, getNextFetchers } from '@/helpers/getNextFetchers';

export async function fetchText(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<string> {
    const response = await fetch(input, init, getNextFetchers(options));
    if (!response.ok) throw new Error('Failed to fetch as Text.');
    return response.text();
}
