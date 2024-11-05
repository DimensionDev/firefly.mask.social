import urlcat from 'urlcat';

import { type ExploreSource, ExploreType, Source } from '@/constants/enum.js';
import { isExploreSource } from '@/helpers/isSocialSource.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveExploreUrl(explore: ExploreType, source: ExploreSource = Source.Farcaster) {
    if (isExploreSource(source) && explore !== ExploreType.CryptoTrends) {
        return urlcat(`/explore/:explore/:source`, {
            explore,
            source: resolveSourceInUrl(source),
        });
    }

    return urlcat(`/explore/:explore`, {
        explore,
    });
}
