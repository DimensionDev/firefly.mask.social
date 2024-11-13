import urlcat from 'urlcat';

import { type ExploreSource, ExploreType } from '@/constants/enum.js';
import { resolveExploreSourceInURL } from '@/helpers/resolveSourceInUrl.js';

export function resolveExploreUrl(explore: ExploreType, source?: ExploreSource) {
    if (source) {
        return urlcat(`/explore/:explore/:source`, {
            explore,
            source: resolveExploreSourceInURL(source),
        });
    }

    return urlcat(`/explore/:explore`, {
        explore,
    });
}
