'use client';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-coverflow';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash-es';
import { useMemo } from 'react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { AsideTitle } from '@/components/AsideTitle.js';
import { ProfileSlide } from '@/components/SuggestedFollows/ProfileSlide.js';
import { DiscoverType, PageRoute, Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SuggestedFollowsCard() {
    const currentSource = useGlobalState.use.currentSource();
    const profileAll = useCurrentProfileAll();
    const { data: suggestedFollows, isLoading } = useQuery({
        queryKey: ['suggested-follows-lite'],
        staleTime: 1000 * 60 * 2,
        queryFn: async () => {
            const farcasterData = (await FarcasterSocialMediaProvider.getSuggestedFollows())?.data;
            const lensData = (await LensSocialMediaProvider.getSuggestedFollows())?.data;
            return shuffle(
                [...(farcasterData ?? []), ...(lensData ?? [])].filter(
                    (item) => !item.viewerContext?.blocking && !item.viewerContext?.following,
                ),
            );
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
            source: isSocialSource(currentSource) ? resolveSourceInURL(currentSource) : SourceInURL.Farcaster,
            discover: DiscoverType.TopProfiles,
        });
    }, [currentSource, profileAll.Farcaster, profileAll.Lens]);

    if (!profileAll.Farcaster && !profileAll.Lens) return null;

    if (isLoading) {
        return (
            <div className="flex h-[268px] w-full shrink-0 items-center justify-center">
                <LoadingIcon width={16} height={16} className="animate-spin" />
            </div>
        );
    }

    if (!suggestedFollows?.length) return null;

    return (
        <div>
            <AsideTitle className="flex items-center justify-between !px-3">
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
                    autoplay={{ delay: 2000 }}
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
