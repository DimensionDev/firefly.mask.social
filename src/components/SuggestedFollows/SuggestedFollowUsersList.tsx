'use client';

import { Trans } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import ComeBack from '@/assets/comeback.svg';
import { ListInPage } from '@/components/ListInPage.js';
import { getSuggestedFollowUserInList } from '@/components/SuggestedFollows/SuggestedFollowUserInList.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useComeBack } from '@/hooks/useComeback.js';
import type { Profile, SuggestedFollowUserProfile } from '@/providers/types/SocialMedia.js';

interface Props {
    source: SocialSource;
}

export default function SuggestedFollowUsersList({ source }: Props) {
    const comeback = useComeBack();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['suggested-follows', source],
        queryFn({ pageParam }) {
            if (source === Source.Twitter)
                return createPageable<SuggestedFollowUserProfile>(EMPTY_LIST, createIndicator(undefined));
            const provider = resolveSocialMediaProvider(source);
            return provider.getSuggestedFollowUsers({ indicator: createIndicator(undefined, pageParam) });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => (lastPage as Pageable<Profile, PageIndicator>)?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? []),
    });

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Trending {source} Users</Trans>
                </h2>
            </div>
            <ListInPage
                key={source}
                queryResult={queryResult}
                VirtualListProps={{
                    key: `${ScrollListKey.SuggestedUsers}:${source}`,
                    computeItemKey: (index, item: SuggestedFollowUserProfile) => `${item.profileId}-${index}`,
                    itemContent: (index, item) => getSuggestedFollowUserInList(index, source, item),
                }}
                NoResultsFallbackProps={{
                    className: 'pt-[228px]',
                }}
            />
        </div>
    );
}
