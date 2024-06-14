'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { AsideTitle } from '@/components/AsideTitle.js';
import { SuggestedFollowUser } from '@/components/SuggestedFollows/SuggestedFollowUser.js';
import { DiscoverType, FireflyPlatform, PageRoute, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SuggestedFollowsCard() {
    const currentSource = useGlobalState.use.currentSource();
    const { data: farcasterData, isLoading: isLoadingFarcaster } = useQuery({
        queryKey: ['suggested-follows-lite', Source.Farcaster],
        async queryFn() {
            let result = await FarcasterSocialMediaProvider.getSuggestedFollowUsers();
            let data: Profile[] = [];
            let sliceIndex = 0;
            while (data.length < 3 && result.data.length - sliceIndex > 0) {
                const sliceEndIndex = 3 - data.length;
                const newData = (
                    await Promise.all(
                        result.data.slice(sliceIndex, sliceEndIndex).map(async (item) => ({
                            ...item,
                            viewerContext: {
                                ...item.viewerContext,
                                blocking: await FireflySocialMediaProvider.isProfileMuted(
                                    FireflyPlatform.Farcaster,
                                    item.profileId,
                                ),
                            },
                        })),
                    )
                ).filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following);
                sliceIndex = sliceIndex + sliceEndIndex;
                data = [...data, ...newData];
                if (data.length < 3 && result.data.length - sliceIndex <= 0 && result.nextIndicator) {
                    result = await FarcasterSocialMediaProvider.getSuggestedFollowUsers({
                        indicator: result.nextIndicator,
                    });
                    sliceIndex = 0;
                }
            }
            return data;
        },
    });
    const { data: lensData, isLoading: isLoadingLens } = useQuery({
        queryKey: ['suggested-follows-lite', Source.Lens],
        async queryFn() {
            const result = await LensSocialMediaProvider.getSuggestedFollowUsers();
            return result.data
                .filter((item) => !item.viewerContext?.blocking && !item.viewerContext?.following)
                .slice(0, 3);
        },
    });

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
                                  <SuggestedFollowUser
                                      key={profile.profileId}
                                      profile={profile}
                                      source={Source.Farcaster}
                                  />
                              ))
                            : loadingEl}
                        {!isLoadingLens
                            ? lensData?.map((profile) => (
                                  <SuggestedFollowUser key={profile.profileId} profile={profile} source={Source.Lens} />
                              ))
                            : loadingEl}
                    </>
                )}
            </div>
            <Link
                href={urlcat(PageRoute.Home, {
                    source: resolveSourceInURL(currentSource),
                    discover: DiscoverType.TopProfiles,
                })}
                className="flex px-4 py-2 text-[15px] font-bold leading-[24px] text-fireflyBrand"
            >
                <Trans>Show more</Trans>
            </Link>
        </div>
    );
}
