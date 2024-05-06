import { useQuery } from '@tanstack/react-query';
import { compact, uniq } from 'lodash-es';
import { useDebounce } from 'usehooks-ts';

import { CHANNEL_SEARCH_LIST_SIZE, FF_GARDEN_CHANNEL_ID, HOME_CHANNEL } from '@/constants/channel.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useFetchChannel } from '@/hooks/useFetchChannel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function useSearchChannels(
    kw: string,
    source: SocialPlatform,
): { channelList: Channel[]; queryResult: ReturnType<typeof useQuery> } {
    const defaultChannels = useDefaultChannelList(source);
    const debouncedKw = useDebounce(kw, 300);

    const queryResult = useQuery({
        enabled: !!debouncedKw,
        queryKey: ['searchChannels', source, debouncedKw],
        queryFn: () => resolveSocialMediaProvider(source).searchChannels(debouncedKw),
    });

    if (!debouncedKw) return { channelList: defaultChannels, queryResult };
    if (!queryResult.data) return { channelList: EMPTY_LIST, queryResult };

    return {
        channelList: compact(queryResult.data.data).slice(0, CHANNEL_SEARCH_LIST_SIZE),
        queryResult,
    };
}

export function useDefaultChannelList(source: SocialPlatform) {
    const ffGardenChannel = useFetchChannel(FF_GARDEN_CHANNEL_ID, source);
    const followedChannels = useFollowedChannels(source, CHANNEL_SEARCH_LIST_SIZE);
    const { rpPayload } = useCompositePost();

    switch (source) {
        case SocialPlatform.Farcaster:
            return uniq(compact([HOME_CHANNEL, rpPayload ? ffGardenChannel : null, ...followedChannels])).slice(
                0,
                CHANNEL_SEARCH_LIST_SIZE,
            ) as Channel[];
        default:
            return [];
    }
}

/**
 *  @note: this is temporary solution, using searchChannels('') to get followed channels
 */
export function useFollowedChannels(source: SocialPlatform, count: number) {
    const { data } = useQuery({
        queryKey: ['searchFollowChannel', source],
        queryFn: () => {
            return resolveSocialMediaProvider(source).searchChannels('');
        },
    });
    return data?.data.slice(0, count) || ([] as Channel[]);
}
