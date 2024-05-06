import { compact, uniq } from 'lodash-es';
import { useAsync, useAsyncFn } from 'react-use';
import { useDebounce } from 'usehooks-ts';

import { CHANNEL_SEARCH_LIST_SIZE, FF_GARDEN_CHANNEL_ID, HOME_CHANNEL } from '@/constants/channel.js';
import { SocialPlatform } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useFetchChannel } from '@/hooks/useFetchChannel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { EMPTY_LIST } from '@/constants/index.js';

export function useSearchChannels(
    kw: string,
    source: SocialPlatform,
): { channelList: Channel[]; isLoading: boolean; isError: boolean } {
    const defaultChannels = useDefaultChannelList(source);
    const debouncedKw = useDebounce(kw, 300);

    const { data, isLoading, isError } = useQuery({
        enabled: !!debouncedKw,
        queryKey: ['searchChannels', source, debouncedKw],
        queryFn: () => resolveSocialMediaProvider(source).searchChannels(debouncedKw),
    });

    if (!debouncedKw) return { channelList: defaultChannels, isLoading: false, isError: false };
    if (!data) return { channelList: EMPTY_LIST, isLoading, isError };

    return { channelList: compact(data.data).slice(0, CHANNEL_SEARCH_LIST_SIZE), isLoading, isError: false };
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
