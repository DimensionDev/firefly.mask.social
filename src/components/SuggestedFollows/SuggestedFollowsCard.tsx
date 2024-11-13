'use client';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-coverflow';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { AsideTitle } from '@/components/AsideTitle.js';
import { ProfileSlide } from '@/components/SuggestedFollows/ProfileSlide.js';
import { ExploreType, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getSuggestedFollowsInCard } from '@/services/getSuggestedFollows.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

function sortProfiles(farcasterProfiles: Profile[], lensProfiles: Profile[]) {
    const results: Profile[] = [];
    let farcasterIndex = 0;
    let lensIndex = 0;
    while (farcasterIndex < farcasterProfiles.length || lensIndex < lensProfiles.length) {
        if (farcasterIndex < farcasterProfiles.length) {
            results.push(farcasterProfiles[farcasterIndex]);
            farcasterIndex += 1;
        }
        if (lensIndex < lensProfiles.length) {
            results.push(lensProfiles[lensIndex]);
            lensIndex += 1;
        }
    }

    return results;
}

export function SuggestedFollowsCard() {
    const isLarge = useIsLarge('min');
    const currentSource = useGlobalState.use.currentSource();
    const profileAll = useCurrentProfileAll();
    const { data: suggestedFollows, isLoading } = useQuery({
        queryKey: ['suggested-follows-lite'],
        staleTime: 1000 * 60 * 2,
        queryFn: async () => {
            const [farcasterData, lensData] = await Promise.all([
                runInSafeAsync(() => getSuggestedFollowsInCard(Source.Farcaster)),
                runInSafeAsync(() => getSuggestedFollowsInCard(Source.Lens)),
            ]);
            return sortProfiles(farcasterData ?? [], lensData ?? []);
        },
    });

    const showMoreUrl = useMemo(() => {
        const isOnlyFarcaster = !!profileAll.Farcaster && !profileAll.Lens;
        const isOnlyLens = !profileAll.Farcaster && !!profileAll.Lens;
        if (isOnlyFarcaster) {
            return resolveExploreUrl(ExploreType.TopProfiles, Source.Farcaster);
        }
        if (isOnlyLens) {
            return resolveExploreUrl(ExploreType.TopProfiles, Source.Lens);
        }
        return resolveExploreUrl(
            ExploreType.TopProfiles,
            isSocialDiscoverSource(currentSource) ? currentSource : Source.Farcaster,
        );
    }, [currentSource, profileAll.Farcaster, profileAll.Lens]);

    if (!profileAll.Farcaster && !profileAll.Lens) return null;

    if (isLoading) {
        return (
            <div className="flex h-[252px] w-full shrink-0 animate-pulse flex-col gap-4">
                <div className="mx-3 h-7 bg-bg" />
                <div className="w-full flex-1 rounded-xl bg-bg" />
            </div>
        );
    }

    if (!suggestedFollows?.length || !isLarge) return null;

    return (
        <section>
            <AsideTitle className="flex items-center justify-between">
                <span className="text-xl">
                    <Trans>You might like</Trans>
                </span>
                <Link href={showMoreUrl} className="text-[15px] text-highlight">
                    <Trans>More</Trans>
                </Link>
            </AsideTitle>
            <div className="rounded-xl bg-bg">
                <Swiper
                    initialSlide={suggestedFollows.length > 2 ? 1 : 0}
                    effect={'coverflow'}
                    grabCursor
                    centeredSlides
                    slidesPerView={'auto'}
                    coverflowEffect={{
                        rotate: 50,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: false,
                    }}
                    pagination
                    loop
                    updateOnWindowResize={false}
                    resizeObserver={false}
                    wrapperClass="!box-border"
                    autoplay={{ delay: 5000 }}
                    modules={[Autoplay, EffectCoverflow]}
                >
                    {suggestedFollows.map((profile, key) => (
                        <SwiperSlide className="!h-[208px] !w-[164px]" key={key}>
                            <div className="py-3">
                                <ProfileSlide profile={profile} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
