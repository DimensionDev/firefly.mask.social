import { uniqBy } from 'lodash-es';

import { URL_REGEX } from '@/constants/regexp.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';

export function parseURLs(content: string): string[] {
    if (!content) return [];

    URL_REGEX.lastIndex = 0;

    return uniqBy(
        [...content.matchAll(URL_REGEX)].map((x) => fixUrlProtocol(x[0])),
        (x) => x.toLowerCase(),
    );
}
