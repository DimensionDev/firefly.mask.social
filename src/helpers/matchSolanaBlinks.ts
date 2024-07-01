import { uniqBy } from 'lodash-es';

import { CONTENT_SOLANA_BLINKS_REGEX, SOLANA_BLINKS_PREFIX } from '@/constants/regexp.js';
import { matchUrls } from '@/helpers/matchUrls.js';

export function matchSolanaBlinks(
    content: string,
    {
        matchHttpsUrl = false,
        keepPrefix = false,
    }: {
        matchHttpsUrl?: boolean;
        keepPrefix?: boolean;
    } = {},
) {
    if (!content) return [];

    const httpsUrls = matchHttpsUrl
        ? matchUrls(content).filter((x) => {
              try {
                  const url = new URL(x);
                  const action = url.searchParams.get('action');
                  if (!action) return false;
                  return action.startsWith('solana-action:https://');
              } catch {
                  return false;
              }
          })
        : [];

    const match = [...content.matchAll(CONTENT_SOLANA_BLINKS_REGEX)];
    const solanaUrls = keepPrefix ? match.map((x) => x[0]) : match.map((x) => x[0].replace(SOLANA_BLINKS_PREFIX, ''));

    return uniqBy([...httpsUrls, ...solanaUrls], (x) => x.toLowerCase());
}
