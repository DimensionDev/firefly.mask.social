import { fetch } from '@/helpers/fetch';
import { NextFetchersOptions, getNextFetchers } from '@/helpers/getNextFetchers';

export async function fetchGlobal(
    input: RequestInfo,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Response> {
    return fetch(input, init, getNextFetchers(options));
}
