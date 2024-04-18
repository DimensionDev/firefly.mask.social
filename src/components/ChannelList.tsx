import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ChannelInList } from '@/components/Channel/ChannelInList.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, SocialPlatform } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

const getChannelItemContent = (index: number, channel: Channel) => {
    return <ChannelInList key={channel.id} channel={channel} />;
};

interface ChannelListProps {
    source: SocialPlatform;
    profileId: string;
}

export function ChannelList({ source, profileId }: ChannelListProps) {
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['channels', source, 'channels-of', profileId],

        queryFn: async ({ pageParam }) => {
            if (!profileId) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(source);
            if (!provider) return createPageable(EMPTY_LIST, undefined);

            return provider.getChannelsByProfileId(profileId, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => {
            return data.pages.flatMap((x) => x.data) || EMPTY_LIST;
        },
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (!data.length) {
        return <NoResultsFallback className="mt-20" />;
    }

    return (
        <VirtualList
            key={source}
            listKey={`${ScrollListKey.Channel}:${profileId}`}
            computeItemKey={(index, post) => `${post.id}-${index}`}
            data={data}
            endReached={onEndReached}
            itemContent={getChannelItemContent}
            useWindowScroll
            context={{ hasNextPage }}
            components={{
                Footer: VirtualListFooter,
            }}
        />
    );
}
