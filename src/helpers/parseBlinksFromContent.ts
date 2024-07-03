import { uniqBy } from 'lodash-es';

import { CONTENT_SOLANA_BLINK_REGEX, SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { matchUrls } from '@/helpers/matchUrls.js';
import { parseURL } from '@/helpers/parseURL.js';

type ActionUrl =
    | {
          isBlink: true;
          decodedActionUrl: string;
          url: string;
      }
    | {
          isBlink: false;
          url: string;
      };

function decodeActionUrl(url: string): ActionUrl {
    const parsedUrl = parseURL(url);
    if (!parsedUrl) return { isBlink: false, url };

    const actionUrl = parsedUrl.searchParams.get('action');
    if (!actionUrl) {
        return { isBlink: false, url };
    }
    const urlDecodedActionUrl = decodeURIComponent(actionUrl);

    const solanaActionPrefix = /^(solana-action:|solana:)/;
    if (!solanaActionPrefix.test(urlDecodedActionUrl)) {
        return { isBlink: false, url };
    }
    const decodedActionUrl = urlDecodedActionUrl.replace(solanaActionPrefix, '');

    const parsedActionUrl = parseURL(decodedActionUrl);
    if (!parsedActionUrl) return { isBlink: false, url };

    return {
        url,
        isBlink: true,
        decodedActionUrl: parsedActionUrl.toString(),
    };
}

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
