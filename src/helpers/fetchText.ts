import { i18n } from '@lingui/core';

import { fetch } from '@/helpers/fetch.js';
import { getNextFetchers, type NextFetchersOptions } from '@/helpers/getNextFetchers.js';

export async function fetchText(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<string> {
    const response = await fetch(input, init, getNextFetchers(options));
    if (!response.ok) throw new Error(i18n._('Failed to fetch as Text.'));
    return response.text();
}
