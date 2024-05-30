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

const PROFILE_CHANNELS_LIMIT = 10;

async function searchChannels(source: SocialSource, keyword: string, { hasRedPacket, profileId }: SearchExtraOptions) {
    const provider = resolveSocialMediaProvider(source);
    if (!keyword && profileId) {
        const profileChannels = await provider.getChannelsByProfileId(profileId);
        const commonChannels = [
            ...profileChannels.data.slice(0, PROFILE_CHANNELS_LIMIT),
            ...(await provider.discoverChannels()).data,
        ];
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
                    ...commonChannels,
                ]),
                'id',
            );
        }
        return uniqBy(compact(commonChannels), 'id');
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
