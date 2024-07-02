import { parseURL } from '@/helpers/parseURL.js';

export type isActionUrl =
    | {
          isBlink: true;
          decodedActionUrl: string;
          url: string;
      }
    | {
          isBlink: false;
          url: string;
      };

export function decodeActionUrl(url: string): isActionUrl {
    const urlObj = parseURL(url);
    if (!urlObj) return { isBlink: false, url };

    const actionUrl = urlObj.searchParams.get('action');
    if (!actionUrl) {
        return { isBlink: false, url };
    }
    const urlDecodedActionUrl = decodeURIComponent(actionUrl);

    const solanaActionPrefix = /^(solana-action:|solana:)/;
    if (!solanaActionPrefix.test(urlDecodedActionUrl)) {
        return { isBlink: false, url };
    }
    const decodedActionUrl = urlDecodedActionUrl.replace(solanaActionPrefix, '');

    const decodedActionUrlObj = parseURL(decodedActionUrl);
    if (!decodedActionUrlObj) return { isBlink: false, url };

    return {
        url,
        isBlink: true,
        decodedActionUrl: decodedActionUrlObj.toString(),
    };
}
