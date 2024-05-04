import { useAsync, useAsyncFn, useDebounce } from 'react-use';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';

export const homeChannel: Channel = {
    name: 'Home',
    id: '', // empty id used as home channel id
    imageUrl: '',
    source: SocialPlatform.Farcaster,
    url: '',
    parentUrl: '',
    followerCount: 0,
    timestamp: 0,
};
export function isHomeChannel(channel: Channel) {
    return channel.id === homeChannel.id;
}
const channelCache: Record<string, Channel> = {};
export async function fetchChannel(chanelId: string) {
    if (channelCache[chanelId]) return channelCache[chanelId];
    channelCache[chanelId] = await FarcasterSocialMediaProvider.getChannelById(chanelId);
    return channelCache[chanelId];
}
export async function fetchFireflyGardenChannel() {
    return fetchChannel('firefly-garden');
}

export function useSearchChannels(kw: string) {
    const defaultChannels = useDefaultChannelList();
    const [{ value }, searchChannel] = useAsyncFn(async (keyword: string) => {
        return FarcasterSocialMediaProvider.searchChannels(keyword);
    }, []);
    useDebounce(async () => searchChannel(kw), 300, []);

    return kw ? value?.data.filter(Boolean).slice(0, 10) || ([] as Channel[]) : defaultChannels;
}
export function useDefaultChannelList() {
    const { value: fireflyChannel } = useAsync(async () => fetchFireflyGardenChannel(), []);
    const followedChannels = useFollowedChannels();
    return [homeChannel, fireflyChannel, ...followedChannels].filter(Boolean) as Channel[];
}
export function useShowChannel() {
    const { availableSources, channel } = useCompositePost();
    const { type } = useComposeStateStore();
    return availableSources.includes(SocialPlatform.Farcaster) && type === 'compose';
}
export function useSetDefaultSelectedChannel(kw: string) {
    const showChannel = useShowChannel();
    const { rpPayload, channel } = useCompositePost();
    const { updateChannel } = useComposeStateStore();
    const { value: fireflyChannel } = useAsync(async () => fetchFireflyGardenChannel(), []);
    const preRpPayload = usePrevious(rpPayload);
    useEffect(() => {
        if (!showChannel) return;
        if (kw) return;
        if (!channel) {
            updateChannel(homeChannel);
            return;
        }
        // if (!preRpPayload && rpPayload && isHomeChannel(channel)) {
        //     fireflyChannel && updateChannel(fireflyChannel);
        //     return;
        // }
    }, [channel, fireflyChannel, kw, preRpPayload, rpPayload, showChannel, updateChannel]);

    return homeChannel;
}

export function useFollowedChannels() {
    const { value } = useAsync(async () => FarcasterSocialMediaProvider.searchChannels(''), []);
    return value?.data.slice(0, 10) || ([] as Channel[]);
}
