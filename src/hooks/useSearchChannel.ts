import { useAsync, useAsyncFn, useDebounce } from 'react-use';

import { CHANNEL_SEARCH_LIST_SIZE, HOME_CHANNEL } from '@/constants/channel.js';
import { SocialPlatform } from '@/constants/enum.js';
import { fetchFireflyGardenChannel } from '@/helpers/channel.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function useSearchChannels(kw: string, source: SocialPlatform) {
    const defaultChannels = useDefaultChannelList(source);
    const [{ value }, searchChannel] = useAsyncFn(async () => {
        return resolveSocialMediaProvider(source).searchChannels(kw);
    }, [kw, source]);

    useDebounce(async () => searchChannel(), 300, [searchChannel]);
    return kw ? value?.data.filter(Boolean).slice(0, CHANNEL_SEARCH_LIST_SIZE) || ([] as Channel[]) : defaultChannels;
}

export function useDefaultChannelList(source: SocialPlatform) {
    const { value: fireflyChannel } = useAsync(async () => fetchFireflyGardenChannel(source), []);
    const followedChannels = useFollowedChannels(source, CHANNEL_SEARCH_LIST_SIZE);
    const { rpPayload } = useCompositePost();

    switch (source) {
        case SocialPlatform.Farcaster:
            return [HOME_CHANNEL, rpPayload ? fireflyChannel : null, ...followedChannels]
                .filter(Boolean)
                .slice(0, CHANNEL_SEARCH_LIST_SIZE) as Channel[];
        default:
            return [];
    }
}

/**
 *  暂时用searchChannels代替followedChannels
 */
export function useFollowedChannels(source: SocialPlatform, count: number) {
    const provider = resolveSocialMediaProvider(source);
    const { value } = useAsync(async () => provider.searchChannels(''), []);
    return value?.data.slice(0, count) || ([] as Channel[]);
}
