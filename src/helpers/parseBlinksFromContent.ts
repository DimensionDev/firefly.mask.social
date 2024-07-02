import { uniqBy } from 'lodash-es';

import { CONTENT_SOLANA_BLINK_REGEX, SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { decodeActionUrl } from '@/helpers/decodeActionUrl.js';
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

    const rawHttpUrls = matchHttpsUrl
        ? matchUrls(content)
              .map(decodeActionUrl)
              .filter((x) => x.isBlink)
        : [];
    const httpsUrls = matchHttpsUrl ? rawHttpUrls.map((x) => x.url) : [];

    const match = [...content.matchAll(CONTENT_SOLANA_BLINK_REGEX)];
    const solanaUrls = match.map((x) => x[0]);

    const urls = uniqBy([...httpsUrls, ...solanaUrls], (x) => x.toLowerCase());
    const decodedUrls = [
        ...rawHttpUrls.map((url) => url.decodedActionUrl),
        ...match.map((x) => x[0].replace(SOLANA_BLINK_PREFIX, '')),
    ];

    return {
        urls,
        decodedUrls,
        content: urls.reduce((acc, url) => acc.replaceAll(url, ''), content), // `solana://https://` will conflict with `https://`, so here we will remove them from content first,
    };
}
