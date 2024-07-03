import { parseURL } from '@/helpers/parseURL.js';

export type ActionUrl =
    | {
          isBlink: true;
          decodedActionUrl: string;
          url: string;
      }
    | {
          isBlink: false;
          url: string;
      };

export function decodeActionUrl(url: string): ActionUrl {
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
