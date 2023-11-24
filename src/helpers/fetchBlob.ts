import { i18n } from '@lingui/core';

import { fetch } from '@/helpers/fetch.js';
import { getNextFetchers, type NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchBlob(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Blob> {
    const response = await fetch(input, init, getNextFetchers(options));
    if (!response.ok) throw new Error(i18n.t('Failed to fetch as Blob.'));
    return response.blob();
}
