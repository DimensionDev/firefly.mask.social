'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { AsideTitle } from '@/components/AsideTitle.js';
import { ProfileCell } from '@/components/Profile/ProfileCell.js';
import { DiscoverType, PageRoute, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SuggestedFollowsCard() {
    const currentSource = useGlobalState.use.currentSource();
    const profileAll = useCurrentProfileAll();
    const { data: farcasterData, isLoading: isLoadingFarcaster } = useSuspenseInfiniteQuery({
        queryKey: ['suggested-follows', Source.Farcaster],
        queryFn({ pageParam }) {
            return FarcasterSocialMediaProvider.getSuggestedFollows(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => (lastPage as Pageable<Profile, PageIndicator>)?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? []),
    });
    const { data: lensData, isLoading: isLoadingLens } = useSuspenseInfiniteQuery({
        queryKey: ['suggested-follows', Source.Lens],
        queryFn({ pageParam }) {
            return LensSocialMediaProvider.getSuggestedFollows(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => (lastPage as Pageable<Profile, PageIndicator>)?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? []),
    });

    const showMoreUrl = useMemo(() => {
        const isOnlyFarcaster = !!profileAll.Farcaster && !profileAll.Lens;
        const isOnlyLens = !profileAll.Farcaster && !!profileAll.Lens;
        if (isOnlyFarcaster) {
            return urlcat(PageRoute.Home, {
                source: resolveSourceInURL(Source.Farcaster),
                discover: DiscoverType.TopProfiles,
            });
        }
        if (isOnlyLens) {
            return urlcat(PageRoute.Home, {
                source: resolveSourceInURL(Source.Lens),
                discover: DiscoverType.TopProfiles,
            });
        }
        return urlcat(PageRoute.Home, {
            source: resolveSourceInURL(currentSource),
            discover: DiscoverType.TopProfiles,
        });
    }, [currentSource, profileAll.Farcaster, profileAll.Lens]);

    if (!profileAll.Farcaster && !profileAll.Lens) {
        return null;
    }

    const loadingEl = (
        <div className="flex h-[180px] w-full items-center justify-center">
            <LoadingIcon width={16} height={16} className="animate-spin" />
        </div>
    );

    return (
        <div className="rounded-lg border border-line dark:border-0 dark:bg-lightBg">
            <AsideTitle>
                <Trans>Suggested Follows</Trans>
            </AsideTitle>
            <div className="flex w-full flex-col">
                {isLoadingFarcaster && isLoadingLens ? (
                    <div className="flex h-[360px] w-full items-center justify-center">
                        <LoadingIcon width={16} height={16} className="animate-spin" />
                    </div>
                ) : (
                    <>
                        {!isLoadingFarcaster
                            ? farcasterData
                                  ?.filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following)
                                  ?.slice(0, 3)
                                  ?.map((profile) => (
                                      <ProfileCell key={profile.profileId} profile={profile} source={profile.source} />
                                  ))
                            : loadingEl}
                        {!isLoadingLens
                            ? lensData
                                  ?.filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following)
                                  ?.slice(0, 3)
                                  ?.map((profile) => (
                                      <ProfileCell key={profile.profileId} profile={profile} source={profile.source} />
                                  ))
                            : loadingEl}
                    </>
                )}
            </div>
            <Link href={showMoreUrl} className="flex px-4 py-2 text-[15px] font-bold leading-[24px] text-fireflyBrand">
                <Trans>Show more</Trans>
            </Link>
        </div>
    );
}
