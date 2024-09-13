'use client';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-coverflow';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import LoadingIcon from '@/assets/loading.svg';
import { AsideTitle } from '@/components/AsideTitle.js';
import { ProfileSlide } from '@/components/SuggestedFollows/ProfileSlide.js';
import { DiscoverType, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { runInSafe } from '@/helpers/runInSafe.js';
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
                runInSafe(() => getSuggestedFollowsInCard(Source.Farcaster)),
                runInSafe(() => getSuggestedFollowsInCard(Source.Lens)),
            ]);
            return sortProfiles(farcasterData ?? [], lensData ?? []);
        },
    });

    const showMoreUrl = useMemo(() => {
        const isOnlyFarcaster = !!profileAll.Farcaster && !profileAll.Lens;
        const isOnlyLens = !profileAll.Farcaster && !!profileAll.Lens;
        if (isOnlyFarcaster) {
            return resolveDiscoverUrl(Source.Farcaster, DiscoverType.TopProfiles);
        }
        if (isOnlyLens) {
            return resolveDiscoverUrl(Source.Lens, DiscoverType.TopProfiles);
        }
        return resolveDiscoverUrl(
            isSocialDiscoverSource(currentSource) ? currentSource : Source.Farcaster,
            DiscoverType.TopProfiles,
        );
    }, [currentSource, profileAll.Farcaster, profileAll.Lens]);

    if (!profileAll.Farcaster && !profileAll.Lens) return null;

    if (isLoading) {
        return (
            <div className="flex h-[268px] w-full shrink-0 items-center justify-center">
                <LoadingIcon width={16} height={16} className="animate-spin" />
            </div>
        );
    }

    if (!suggestedFollows?.length || !isLarge) return null;

    return (
        <div className="-mb-3">
            <AsideTitle className="flex items-center justify-between !pb-1">
                <span className="text-xl">
                    <Trans>You might like</Trans>
                </span>
                <Link href={showMoreUrl} className="text-[15px] text-lightHighlight">
                    <Trans>More</Trans>
                </Link>
            </AsideTitle>
            <div>
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
        </div>
    );
}
