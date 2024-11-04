'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { CrossProfileItem } from '@/components/Search/CrossProfileItem.js';
import { SearchableNFTItem } from '@/components/Search/SearchableNFTItem.js';
import { SearchableTokenItem } from '@/components/Search/SearchableTokenItem.js';
import { SearchSources } from '@/components/Search/SearchSources.js';
import { TokenMarketData } from '@/components/TokenProfile/TokenMarketData.js';
import { ScrollListKey, SearchType } from '@/constants/enum.js';
import { formatSearchIdentities } from '@/helpers/formatSearchIdentities.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { CoingeckoCoinMarketInfo, CoingeckoToken } from '@/providers/types/Coingecko.js';
import type { FireflyCrossProfile, SearchableNFT, SearchableToken } from '@/providers/types/Firefly.js';
import type { Channel, Post } from '@/providers/types/SocialMedia.js';
import { searchTokens } from '@/services/searchTokens.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

type TokenWithMarket = SearchableToken & { market?: CoingeckoCoinMarketInfo; hit?: boolean };

function formatMarketToken(token: SearchableToken) {
    return {
        pluginID: 'string',
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        source: '',
        type: 'FungibleToken',
        logoURL: token.thumb,
        rank: token.market_cap_rank,
        socialLinks: {
            website: '',
            twitter: '',
            telegram: '',
        },
    } as CoingeckoToken;
}

const getSearchItemContent = (
    index: number,
    item: Post | FireflyCrossProfile | Channel | SearchableNFT | TokenWithMarket,
    searchType: SearchType,
    listKey: string,
    keyword: string,
) => {
    switch (searchType) {
        case SearchType.Profiles:
            const profile = item as FireflyCrossProfile;
            return <CrossProfileItem profile={profile} key={`${profile.platform}_${profile.profileId}`} />;
        case SearchType.Posts:
            const post = item as Post;
            return <SinglePost key={post.postId} post={post} listKey={listKey} index={index} />;
        case SearchType.Channels:
            const channel = item as Channel;
            return <ChannelInList key={channel.id} channel={channel} listKey={listKey} index={index} />;
        case SearchType.NFTs:
            const nft = item as SearchableNFT;
            return <SearchableNFTItem key={nft.contract_address} nft={nft} />;
        case SearchType.Tokens:
            const token = item as TokenWithMarket;
            return token.hit ? (
                <div className="p-3">
                    <TokenMarketData linkable token={formatMarketToken(token)} />
                </div>
            ) : (
                <SearchableTokenItem key={token.id} token={token} />
            );
        default:
            safeUnreachable(searchType);
            return null;
    }
};

export default function Page() {
    const { searchKeyword, searchType, source } = useSearchStateStore();
    const currentSocialSource = narrowToSocialSource(source);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, source],
        queryFn: async ({ pageParam }) => {
            if (!searchKeyword) return;
            const provider = resolveSocialMediaProvider(currentSocialSource);
            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            switch (searchType) {
                case SearchType.Profiles:
                    const data = await FireflyEndpointProvider.searchIdentity(searchKeyword, 25, indicator);
                    return {
                        ...data,
                        data: formatSearchIdentities(data.data),
                    };
                case SearchType.Posts:
                    return provider.searchPosts(searchKeyword.replace(/^#/, ''), indicator);
                case SearchType.Channels:
                    return provider.searchChannels(searchKeyword, indicator);
                case SearchType.NFTs:
                    return FireflyEndpointProvider.searchNFTs(searchKeyword);
                case SearchType.Tokens:
                    return searchTokens(searchKeyword);
                default:
                    safeUnreachable(searchType);
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select(data) {
            return compact(
                data.pages.flatMap(
                    (x) =>
                        (x?.data ?? []) as Array<
                            FireflyCrossProfile | Post | Channel | SearchableNFT | TokenWithMarket
                        >,
                ),
            );
        },
    });

    useNavigatorTitle(t`Search`);

    const listKey = `${ScrollListKey.Search}:${searchType}:${searchKeyword}:${source}`;

    return (
        <>
            {searchType === SearchType.Posts ? (
                <SearchSources source={source} query={searchKeyword} searchType={searchType} />
            ) : null}
            <ListInPage
                source={source}
                key={listKey}
                queryResult={queryResult}
                VirtualListProps={{
                    listKey,
                    computeItemKey: (index, item) => {
                        switch (searchType) {
                            case SearchType.Profiles:
                                const profile = item as FireflyCrossProfile;
                                return `${profile.profileId}_${index}`;
                            case SearchType.Posts:
                                const post = item as Post;
                                return `${post.postId}_${index}`;
                            case SearchType.Channels:
                                const channel = item as Channel;
                                return `${channel.id}_${index}`;
                            case SearchType.NFTs:
                                return `${(item as SearchableNFT).contract_address}_${index}`;
                            case SearchType.Tokens:
                                return `${(item as TokenWithMarket).id}_${index}`;
                            default:
                                safeUnreachable(searchType);
                                return index;
                        }
                    },
                    itemContent: (index, item) => getSearchItemContent(index, item, searchType, listKey, searchKeyword),
                }}
                NoResultsFallbackProps={{
                    message: (
                        <div className="mx-16">
                            <div className="text-sm text-main">{t`No results for "${searchKeyword}"`}</div>
                            <p className="mt-4 text-center text-sm text-second">
                                <Trans>Try searching for something else.</Trans>
                            </p>
                        </div>
                    ),
                }}
            />
        </>
    );
}
