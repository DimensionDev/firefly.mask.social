import { uniqBy } from 'lodash-es';

import { CONTENT_SOLANA_BLINKS_REGEX, SOLANA_BLINKS_PREFIX } from '@/constants/regexp.js';
import { isHttpBlink } from '@/helpers/isHttpBlink.js';
import { matchUrls } from '@/helpers/matchUrls.js';

export function parseBlinkUrlFromContent(
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
            decodeUrls: [],
            content,
        };
    }

    const rawHttpUrls = matchHttpsUrl
        ? matchUrls(content)
              .map(isHttpBlink)
              .filter((x) => x.isBlink)
        : [];
    const httpsUrls = matchHttpsUrl ? rawHttpUrls.map((x) => x.url) : [];

    const match = [...content.matchAll(CONTENT_SOLANA_BLINKS_REGEX)];
    const solanaUrls = match.map((x) => x[0]);

    const urls = uniqBy([...httpsUrls, ...solanaUrls], (x) => x.toLowerCase());
    const decodeUrls = [
        ...rawHttpUrls.map((url) => url.decodedActionUrl),
        ...match.map((x) => x[0].replace(SOLANA_BLINKS_PREFIX, '')),
    ];
    content = urls.reduce((acc, url) => acc.replaceAll(url, ''), content); // `solana://https://` will conflict with `https://`, so here we will remove them from content first

    return {
        urls,
        decodeUrls,
        content,
    };
}
