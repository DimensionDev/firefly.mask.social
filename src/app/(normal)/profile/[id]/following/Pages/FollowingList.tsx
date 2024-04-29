'use client'

import { Trans } from '@lingui/macro';
import { createIndicator, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import ComeBack from '@/assets/comeback.svg';
import { getFollowInList } from '@/components/FollowInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { useComeBack } from '@/hooks/useComeback.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getFollowings } from '@/services/getFollowings.js';

export function FollowingList({ profileId, source }: { profileId: string, source: SourceInURL }) {
    const comeback = useComeBack();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['following', source, profileId],
        async queryFn({ pageParam }) {
            return getFollowings(resolveSocialPlatform(source), profileId, createIndicator(undefined, pageParam))
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => (lastPage as Pageable<Profile, PageIndicator>)?.nextIndicator?.id,
        select: data => data.pages.map(page => page!.data).flat(),
    })

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px] border-b border-line">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Following</Trans>
                </h2>
            </div>
            <ListInPage
                key={source}
                queryResult={queryResult}
                VirtualListProps={{
                    key: `${ScrollListKey.Following}:${source}:${profileId}`,
                    computeItemKey: (index, item: Profile) => `${item.profileId}-${index}`,
                    itemContent: getFollowInList
                }}
                NoResultsFallbackProps={{
                    className: 'pt-[228px]',
                }}
            />
        </div>
    )
}
