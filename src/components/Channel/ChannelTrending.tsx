import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getPostItemContent } from '@/components/VirtualList/getPostItemContent.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { mergeThreadPosts } from '@/helpers/mergeThreadPosts.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel, Post } from '@/providers/types/SocialMedia.js';

interface ChannelTrendingProps {
    channel: Channel;
    source: SocialSource;
}

export function ChannelTrending({ channel, source }: ChannelTrendingProps) {
    const channelId = channel.id;

    const result = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'posts-of', channelId, 'trending'],
        queryFn: async () => {
            if (!channelId) return createPageable<Post>(EMPTY_LIST, createIndicator());
            const provider = resolveSocialMediaProvider(source);
            const posts = await provider.getChannelTrendingPosts(channel);
            return posts;
        },
        staleTime: 1000 * 60 * 5,
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) =>
            mergeThreadPosts(
                source,
                // The timeline api will not return a blocked status for the channel.
                data.pages.flatMap((x) => x.data).map((x) => ({ ...x, channel })),
            ),
    });
    return (
        <ListInPage
            key={source}
            queryResult={result}
            VirtualListProps={{
                listKey: `${ScrollListKey.Channel}:${channelId}:trending`,
                computeItemKey: (index, post) => `${post.postId}-${index}`,
                itemContent: (index, post) => getPostItemContent(index, post, `${ScrollListKey.Channel}:${channelId}:trending`),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
