import { t } from '@lingui/macro';

import { fetch } from '@/helpers/fetch.js';
import { getNextFetchers, type NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchArrayBuffer(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<ArrayBuffer> {
    const response = await fetch(input, init, getNextFetchers(options));
    if (!response.ok) throw new Error(t`Failed to fetch as ArrayBuffer.`);
    return response.arrayBuffer();
}
