import { useQuery } from '@tanstack/react-query';
import { compact, uniq } from 'lodash-es';
import { useDebounce } from 'usehooks-ts';

import { FF_GARDEN_CHANNEL, HOME_CHANNEL } from '@/constants/channel.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_CHANNEL_SOURCES } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

async function searchChannels(source: SocialSource, keyword: string) {
    const provider = resolveSocialMediaProvider(source);
    if (!keyword) {
        const defaultChannels = await provider.searchChannels('');
        return source === Source.Farcaster
            ? uniq(compact([HOME_CHANNEL, FF_GARDEN_CHANNEL, ...defaultChannels.data]))
            : defaultChannels.data;
    }
    const response = await provider.searchChannels(keyword);
    return response.data;
}

export function useSearchChannels(keyword: string) {
    const debouncedKeyword = useDebounce(keyword, 300);
    return useQuery({
        queryKey: ['searchChannels', debouncedKeyword],
        queryFn: async () => {
            const allSettled = await Promise.allSettled(
                SORTED_CHANNEL_SOURCES.map((x) => searchChannels(x, debouncedKeyword)),
            );
            return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []));
        },
    });
}
