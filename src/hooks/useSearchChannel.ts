import { useQuery } from '@tanstack/react-query';
import { compact, uniq } from 'lodash-es';
import { useDebounce } from 'usehooks-ts';

import { FF_GARDEN_CHANNEL, HOME_CHANNEL } from '@/constants/channel.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_CHANNEL_SOURCES } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

async function searchChannels(source: SocialSource, keyword: string, hasRedPacket: boolean) {
    const provider = resolveSocialMediaProvider(source);
    if (!keyword) {
        const defaultChannels = await provider.searchChannels('');
        if (source === Source.Farcaster) {
            return uniq(compact([
                HOME_CHANNEL,
                hasRedPacket ? {
                    ...FF_GARDEN_CHANNEL,
                    followerCount: (await provider.getChannelById(FF_GARDEN_CHANNEL.id)).followerCount,
                } : null,
                ...defaultChannels.data
            ]))
        }
        return defaultChannels.data;
    }
    const response = await provider.searchChannels(keyword);
    return response.data;
}

export function useSearchChannels(keyword: string, hasRedPacket: boolean) {
    const debouncedKeyword = useDebounce(keyword, 300);
    return useQuery({
        queryKey: ['searchChannels', debouncedKeyword, `${hasRedPacket}`],
        queryFn: async () => {
            const allSettled = await Promise.allSettled(
                SORTED_CHANNEL_SOURCES.map((x) => searchChannels(x, debouncedKeyword, hasRedPacket)),
            );
            return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []));
        },
    });
}
