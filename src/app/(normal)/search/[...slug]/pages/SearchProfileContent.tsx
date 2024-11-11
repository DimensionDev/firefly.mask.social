'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { Empty } from '@/components/Search/Empty.js';
import { SearchableProfileItem } from '@/components/Search/SearchableProfileItem.js';
import { ScrollListKey, Source, SourceInURL } from '@/constants/enum.js';
import { formatSearchIdentities } from '@/helpers/formatSearchIdentities.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Profile as FireflyProfile } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

type ProfileWithRelated = { profile: FireflyProfile; related: FireflyProfile[] };

function composeTwitterProfiles(identities: ProfileWithRelated[], xProfiles: Profile[]) {
    return compact([
        ...identities,
        ...xProfiles.map((x) => {
            const existed = identities.some(
                ({ profile }) => profile.platform === SourceInURL.Twitter && profile.platform_id === x.profileId,
            );
            if (existed) return null;

            const matched = {
                platform: SourceInURL.Twitter as const,
                platform_id: x.profileId,
                handle: x.handle,
                name: x.displayName,
                hit: true,
                score: 0,
            };
            return { profile: matched, related: [matched] };
        }),
    ]);
}

const getSearchItemContent = (item: ProfileWithRelated) => {
    const { profile, related } = item;
    return (
        <SearchableProfileItem profile={profile} related={related} key={`${profile.platform}_${profile.platform_id}`} />
    );
};

const noNextPage = '__no_next_page__';

export function SearchProfileContent() {
    const isTwitterLogin = useIsLogin(Source.Twitter);
    const { searchKeyword, searchType, source } = useSearchStateStore();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, source],
        queryFn: async ({ pageParam }) => {
            if (!searchKeyword) return;
            const fireflyIndicator = pageParam.firefly ? createIndicator(undefined, pageParam.firefly) : undefined;
            const twitterIndicator = pageParam.twitter ? createIndicator(undefined, pageParam.twitter) : undefined;

            const data =
                pageParam.firefly !== noNextPage
                    ? await FireflyEndpointProvider.searchIdentity(searchKeyword, 25, fireflyIndicator)
                    : createPageable([], createIndicator());
            const twitterProfiles =
                isTwitterLogin && pageParam.twitter !== noNextPage
                    ? await runInSafeAsync(() =>
                          TwitterSocialMediaProvider.searchProfiles(searchKeyword, twitterIndicator),
                      )
                    : undefined;
            return {
                ...data,
                twitterNextIndicator: twitterProfiles?.nextIndicator,
                data: composeTwitterProfiles(formatSearchIdentities(data.data), twitterProfiles?.data || []),
            };
        },
        initialPageParam: { firefly: '', twitter: '' },
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return {
                firefly: lastPage?.nextIndicator?.id ?? noNextPage,
                twitter: lastPage?.twitterNextIndicator?.id ?? noNextPage,
            };
        },
        select(data) {
            return uniqBy(
                compact(data.pages.flatMap((x) => x?.data ?? [])),
                ({ profile }) => `${profile.platform}_${profile.platform_id}`,
            );
        },
    });

    const listKey = `${ScrollListKey.Search}:${searchType}:${searchKeyword}:${source}`;

    return (
        <ListInPage
            source={source}
            key={listKey}
            queryResult={queryResult}
            VirtualListProps={{
                listKey,
                computeItemKey: (index, item) => `${item.profile.platform_id}_${index}`,
                itemContent: (_, item) => getSearchItemContent(item),
            }}
            NoResultsFallbackProps={{
                message: <Empty keyword={searchKeyword} />,
            }}
        />
    );
}
