import urlcat from 'urlcat';

import { type ExploreSource, ExploreType } from '@/constants/enum.js';

export function resolveExploreUrl(explore: ExploreType, source?: ExploreSource) {
    if (source) {
        return urlcat(`/explore/:explore/:source`, {
            explore,
            source,
        });
    }

    return urlcat(`/explore/:explore`, {
        explore,
    });
}
