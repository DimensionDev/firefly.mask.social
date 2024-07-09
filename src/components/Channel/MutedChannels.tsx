import { createIndicator } from '@/helpers/pageable.js';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface MutedChannelsProps {
    source: SocialSource;
}

const getChannelItemContent = (index: number, channel: Channel, listKey: string) => {
    return <ChannelInList key={channel.id} channel={channel} listKey={listKey} index={index} noMuteButton={false} />;
};

export function MutedChannels({ source }: MutedChannelsProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['channels', source, 'muted-list'],
        queryFn: async ({ pageParam }) => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getBlockedChannels(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            className="no-scrollbar"
            VirtualListProps={{
                useWindowScroll: false,
                listKey: `${ScrollListKey.Channel}:muted`,
                computeItemKey: (index, channel) => `${channel.id}-${index}`,
                itemContent: (index, channel) =>
                    getChannelItemContent(index, channel, `${ScrollListKey.Channel}:muted`),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
