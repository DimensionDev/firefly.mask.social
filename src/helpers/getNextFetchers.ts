import { Fetcher } from '@/helpers/fetch';
import { fetchCached } from '@/helpers/fetchCached';
import { fetchSquashed } from '@/helpers/fetchSquashed';

export interface NextFetchersOptions {
    /** Assigns 0 to disable squash. */
    squashExpiration?: number;
    /** Assigns 0 to disable cache */
    cacheDuration?: number;
    /** Generates an unequal request key. Requests that share the same key will be squashed into a single one. */
    resolver?: (request: Request) => Promise<string>;
}

export function getNextFetchers({ squashExpiration = 0, cacheDuration = 0, resolver }: NextFetchersOptions = {}) {
    const fetchers: Fetcher[] = [];
    if (squashExpiration > 0) fetchers.push((...args) => fetchSquashed(...args, resolver, squashExpiration));
    if (cacheDuration > 0) fetchers.push((...args) => fetchCached(...args, cacheDuration));
    return fetchers;
}
