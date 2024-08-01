import { createPageable } from '@masknet/shared-base';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { EMPTY_LIST } from '@/constants/index.js';
import { formatLensProfileFromSuggestedFollow } from '@/helpers/formatLensProfile.js';
import { createIndicator, type PageIndicator } from '@/helpers/pageable.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { GetLensSuggestedFollowUserResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export async function getLensSuggestFollows(indicator?: PageIndicator) {
    const response = await fireflySessionHolder.fetch<GetLensSuggestedFollowUserResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, `/v1/lens/suggested_follow_list`, {
            cursor: indicator?.id,
        }),
    );
    if (!response.data) return createPageable(EMPTY_LIST, indicator);
    const profiles = compact(response.data.suggestedFollowList.map((x) => x[0])).map((user) =>
        formatLensProfileFromSuggestedFollow(user),
    );
    return createPageable(profiles, indicator, createIndicator(indicator, `${response.data.cursor}`));
}
