import urlcat from 'urlcat';

import { EMPTY_LIST } from '@/constants/index.js';
import { formatFarcasterProfileFromSuggestedFollow } from '@/helpers/formatFarcasterProfileFromSuggestedFollow.js';
import { createIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { GetFarcasterSuggestedFollowUserResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export async function getFarcasterSuggestFollows(indicator?: PageIndicator) {
    const response = await fireflySessionHolder.fetch<GetFarcasterSuggestedFollowUserResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, `/v2/farcaster-hub/suggested_follow_list`, {
            cursor: indicator?.id,
        }),
    );
    if (!response.data) return createPageable(EMPTY_LIST, indicator);
    const profiles =
        response.data?.suggestedFollowList.map((user) => formatFarcasterProfileFromSuggestedFollow(user)) ?? [];
    return createPageable(profiles, indicator, createIndicator(indicator, `${response.data.cursor}`));
}
