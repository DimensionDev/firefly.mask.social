import { fetch } from '@/helpers/fetch';
import { NextFetchersOptions, getNextFetchers } from '@/helpers/getNextFetchers';

export async function fetchBlob(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Blob> {
    const response = await fetch(input, init, getNextFetchers(options));
    if (!response.ok) throw new Error('Failed to fetch as Blob.');
    return response.blob();
}
