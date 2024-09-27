import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

const getChannelItemContent = (index: number, channel: Channel) => {
    return <ChannelInList key={channel.id} channel={channel} />;
};

interface ChannelListProps {
    source: SocialSource;
    profileId: string;
}

export function ChannelList({ source, profileId }: ChannelListProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['channels', source, 'channels-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable<Channel>(EMPTY_LIST, createIndicator());
            const provider = resolveSocialMediaProvider(source);
            return provider.getChannelsByProfileId(profileId, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            source={source}
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Channel}:${profileId}`,
                computeItemKey: (index, channel) => `${channel.id}-${index}`,
                itemContent: getChannelItemContent,
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
