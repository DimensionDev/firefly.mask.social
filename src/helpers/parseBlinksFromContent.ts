import { uniqBy } from 'lodash-es';

import { CONTENT_SOLANA_BLINK_REGEX, SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { matchUrls } from '@/helpers/matchUrls.js';

export function parseBlinksFromContent(
    content: string,
    {
        matchHttpsUrl = false,
    }: {
        matchHttpsUrl?: boolean;
    } = {},
) {
    if (!content) {
        return {
            urls: [],
            decodedUrls: [],
            content,
        };
    }

    const httpsUrls = matchHttpsUrl ? matchUrls(content) : [];

    const match = [...content.matchAll(CONTENT_SOLANA_BLINK_REGEX)];
    const solanaUrls = match.map((x) => x[0]);

    const urls = uniqBy([...httpsUrls, ...solanaUrls], (x) => x.toLowerCase());
    const decodedUrls = [...httpsUrls.map((url) => `${SOLANA_BLINK_PREFIX}${url}`), ...solanaUrls];

    return {
        urls,
        decodedUrls,
        content: urls.reduce((acc, url) => acc.replaceAll(url, ''), content), // `solana://https://` will conflict with `https://`, so here we will remove them from content first,
    };
}
