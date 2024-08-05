'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { AsideTitle } from '@/components/AsideTitle.js';
import { ProfileCell } from '@/components/Profile/ProfileCell.js';
import { DiscoverType, PageRoute, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

async function filterFollowedProfiles(queryCallback: (indicator?: PageIndicator) => Promise<Pageable<Profile>>) {
    let result = await queryCallback();
    let data: Profile[] = [];
    let sliceIndex = 0;
    while (data.length < 3 && result.data.length - sliceIndex > 0) {
        const sliceEndIndex = 3 - data.length;
        const newData = result.data
            .slice(sliceIndex, sliceEndIndex)
            .filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following);
        sliceIndex = sliceIndex + sliceEndIndex;
        data = [...data, ...newData];
        if (data.length < 3 && result.data.length - sliceIndex <= 0 && result.nextIndicator) {
            result = await queryCallback(result.nextIndicator as PageIndicator);
            sliceIndex = 0;
        }
    }
    return data;
}

export function SuggestedFollowsCard() {
    const currentSource = useGlobalState.use.currentSource();
    const profileAll = useCurrentProfileAll();
    const { data: farcasterData, isLoading: isLoadingFarcaster } = useQuery({
        queryKey: ['suggested-follows-lite', Source.Farcaster],
        queryFn() {
            return filterFollowedProfiles(FarcasterSocialMediaProvider.getSuggestedFollows);
        },
    });
    const { data: lensData, isLoading: isLoadingLens } = useQuery({
        queryKey: ['suggested-follows-lite', Source.Lens],
        queryFn() {
            return filterFollowedProfiles(LensSocialMediaProvider.getSuggestedFollows);
        },
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
                            ? farcasterData?.map((profile) => (
                                  <ProfileCell key={profile.profileId} profile={profile} source={profile.source} />
                              ))
                            : loadingEl}
                        {!isLoadingLens
                            ? lensData?.map((profile) => (
                                  <ProfileCell key={profile.profileId} profile={profile} source={profile.source} />
                              ))
                            : loadingEl}
                    </>
                )}
            </div>
            <Link href={showMoreUrl} className="flex px-4 py-2 text-[15px] font-bold leading-[24px] text-lightHighlight">
                <Trans>Show more</Trans>
            </Link>
        </div>
    );
}
