'use client';

import { Trans } from '@lingui/macro';
import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import ComeBack from '@/assets/comeback.svg';
import { getFollowInList } from '@/components/FollowInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, type SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useComeBack } from '@/hooks/useComeback.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function FollowersList({ profileId, source }: { profileId: string; source: SocialSourceInURL }) {
    const comeback = useComeBack();

    const socialSource = resolveSocialSource(source);
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['profiles', socialSource, 'followers', profileId],
        queryFn({ pageParam }) {
            const provider = resolveSocialMediaProvider(socialSource);
            return provider.getFollowers(profileId, createIndicator(undefined, pageParam));
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
                    <Trans>Followers</Trans>
                </h2>
            </div>
            <ListInPage
                key={source}
                queryResult={queryResult}
                VirtualListProps={{
                    key: `${ScrollListKey.Followers}:${source}:${profileId}`,
                    computeItemKey: (index, item: Profile) => `${item.profileId}-${index}`,
                    itemContent: (index, item: Profile) => getFollowInList(index, item),
                }}
                NoResultsFallbackProps={{
                    className: 'pt-[228px]',
                }}
            />
        </div>
    );
}
