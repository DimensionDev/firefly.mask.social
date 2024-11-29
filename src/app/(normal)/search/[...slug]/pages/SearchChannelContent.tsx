'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { Empty } from '@/components/Search/Empty.js';
import { SearchSources } from '@/components/Search/SearchSources.js';
import { ScrollListKey } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

const getSearchItemContent = (channel: Channel, index: number, listKey: string) => {
    return <ChannelInList key={channel.id} channel={channel} listKey={listKey} index={index} />;
};

export function SearchChannelContent() {
    const { searchKeyword, searchType, source } = useSearchStateStore();
    const currentSocialSource = narrowToSocialSource(source);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, source],
        queryFn: async ({ pageParam }) => {
            if (!searchKeyword) return;
            const provider = resolveSocialMediaProvider(currentSocialSource);
            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            return provider.searchChannels(searchKeyword, indicator);
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select(data) {
            return compact(data.pages.flatMap((x) => x?.data ?? []));
        },
    });

    const listKey = `${ScrollListKey.Search}:${searchType}:${searchKeyword}:${source}`;

    return (
        <>
            <SearchSources source={source} query={searchKeyword} searchType={searchType} />
            <ListInPage
                source={source}
                key={listKey}
                queryResult={queryResult}
                VirtualListProps={{
                    listKey,
                    computeItemKey: (index, channel) => `${channel.id}_${index}`,
                    itemContent: (index, channel) => getSearchItemContent(channel, index, listKey),
                }}
                NoResultsFallbackProps={{
                    message: <Empty keyword={searchKeyword} />,
                }}
            />
        </>
    );
}
