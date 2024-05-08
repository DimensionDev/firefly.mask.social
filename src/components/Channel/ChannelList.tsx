import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

const getChannelItemContent = (index: number, channel: Channel) => {
    return <ChannelInList key={channel.id} channel={channel} />;
};

interface ChannelListProps {
    source: SocialSource;
}

export function ChannelList({ source }: ChannelListProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['channels', source, 'channels-of'],
        queryFn: async ({ pageParam }) => {
            // one page only
            if (pageParam === '') {
                const provider = resolveSocialMediaProvider(source);
                return provider.discoverChannels(createIndicator(undefined, pageParam));
            }
            return createPageable<Channel>(EMPTY_LIST, createIndicator());
        },
        initialPageParam: '',
        getNextPageParam: () => null,
        select: (data) => data.pages.flatMap((x) => x.data) || EMPTY_LIST,
    });

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                useWindowScroll: false,
                listKey: `${ScrollListKey.Channel}`,
                computeItemKey: (index, channel) => `${channel.id}-${index}`,
                itemContent: getChannelItemContent,
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
