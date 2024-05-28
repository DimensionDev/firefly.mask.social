import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useDebounce } from 'usehooks-ts';

import { FF_GARDEN_CHANNEL, HOME_CHANNEL } from '@/constants/channel.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_CHANNEL_SOURCES } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

interface SearchExtraOptions {
    hasRedPacket: boolean;
    profileId?: string;
}

async function searchChannels(source: SocialSource, keyword: string, { hasRedPacket, profileId }: SearchExtraOptions) {
    const provider = resolveSocialMediaProvider(source);
    if (!keyword && profileId) {
        const defaultChannels = await provider.getChannelsByProfileId(profileId);
        if (source === Source.Farcaster) {
            return uniqBy(
                compact([
                    HOME_CHANNEL,
                    hasRedPacket
                        ? {
                              ...FF_GARDEN_CHANNEL,
                              followerCount: (await provider.getChannelById(FF_GARDEN_CHANNEL.id)).followerCount,
                          }
                        : null,
                    ...defaultChannels.data,
                ]),
                'id',
            );
        }
        return defaultChannels.data;
    }
    const response = await provider.searchChannels(keyword);
    return response.data;
}

export function useSearchChannels(keyword: string, hasRedPacket: boolean) {
    const debouncedKeyword = useDebounce(keyword, 300);
    const profiles = useCurrentProfileAll();

    return useQuery({
        queryKey: ['searchChannels', debouncedKeyword, `${hasRedPacket}`],
        queryFn: async () => {
            const allSettled = await Promise.allSettled(
                SORTED_CHANNEL_SOURCES.map((x) =>
                    searchChannels(x, debouncedKeyword, { hasRedPacket, profileId: profiles[x]?.profileId }),
                ),
            );
            return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []));
        },
    });
}
