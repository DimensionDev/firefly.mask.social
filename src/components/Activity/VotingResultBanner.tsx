'use client';

import { delay } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { Link } from '@/esm/Link.js';
import { minus } from '@/helpers/number.js';
import { useIsMedium, useIsSmall } from '@/hooks/useMediaQuery.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { ActivityStatus } from '@/providers/types/Firefly.js';

interface VotingResultBannerProps {}

const activityName = 'elex24';

export function VotingResultBanner(props: VotingResultBannerProps) {
    const isSmall = useIsSmall('max');
    const isMedium = useIsMedium('max');

    const enabled = env.external.NEXT_PUBLIC_VOTING_RESULT === STATUS.Enabled;

    const { data: info } = useQuery({
        queryKey: ['activity-info', activityName],
        enabled,
        async queryFn() {
            return FireflyActivityProvider.getFireflyActivityInfo(activityName);
        },
    });
    const ended = info?.status === ActivityStatus.Ended;

    // wait for font loaded
    const { data: fontLoaded } = useQuery({
        queryKey: ['font-loaded', 'level-up'],
        staleTime: 0,
        enabled,
        queryFn: async () => {
            try {
                const fontFace = document.fonts;
                if (typeof fontFace?.load !== 'function') {
                    await delay(200);
                    return true;
                }
                await fontFace.load('1em LevelUp');
                return true;
            } catch {
                return true;
            }
        },
    });

    const { isLoading: loadingResult, data } = useQuery({
        queryKey: ['voting-result'],
        staleTime: 0,
        enabled,
        refetchInterval: !ended ? 1 * 60 * 1000 : false,
        queryFn: () => {
            return FireflyActivityProvider.getVotingResults();
        },
    });

    const strokeWidth = isSmall ? 2 : isMedium ? 3 : 3.5;

    const trumpRatePercent = new BigNumber((data?.trump || 0) * 100).toFixed(0);
    const HarrisRatePercent = data?.trump
        ? minus(100, trumpRatePercent).toFixed(0)
        : new BigNumber((data?.harris || 0) * 100).toFixed(0);

    const showPercent = !!fontLoaded && !loadingResult && !!data;

    return (
        <Link target="_blank" className="relative w-full" href={'/event/elex24'}>
            <div
                className="bg-bgModal"
                style={{
                    backgroundImage: 'url(/image/voting-bg.png)',
                    backgroundSize: '100% 100%',
                    width: '100%',
                    paddingTop: '26.7%',
                }}
            />
            {showPercent ? (
                <>
                    <div
                        className="absolute bottom-[22.5%] left-[25.16%] flex w-[51.08%] justify-between px-[3.3%] text-base text-white"
                        style={{ fontFamily: 'LevelUp' }}
                    >
                        <span className="flex">
                            <span
                                className="text-[14px] sm:text-[24px] md:text-[29px]"
                                style={{ WebkitTextStrokeWidth: strokeWidth, WebkitTextStrokeColor: '#B8133B' }}
                            >
                                {trumpRatePercent}
                            </span>
                            <span
                                className="-ml-1 text-[14px] sm:text-[24px] md:text-[29px]"
                                style={{
                                    WebkitTextStrokeWidth: 1.5,
                                    WebkitTextStrokeColor: '#B8133B',
                                    transform: 'scale(0.6)',
                                }}
                            >
                                %
                            </span>
                        </span>
                        <span className="flex">
                            <span
                                className="text-[14px] sm:text-[24px] md:text-[29px]"
                                style={{ WebkitTextStrokeWidth: strokeWidth, WebkitTextStrokeColor: '#0F53A4' }}
                            >
                                {HarrisRatePercent}
                            </span>
                            <span
                                className="-ml-1 text-[14px] sm:text-[24px] md:text-[29px]"
                                style={{
                                    WebkitTextStrokeWidth: 1.5,
                                    WebkitTextStrokeColor: '#0F53A4',
                                    transform: 'scale(0.6)',
                                }}
                            >
                                %
                            </span>
                        </span>
                    </div>
                    <div
                        className="absolute bottom-[10.93%] left-[25.16%] h-[11.25%] w-[51.08%]"
                        style={{
                            transform: 'skew(-25deg)',
                            background: 'linear-gradient(180deg, #1D7BEB 0%, #002756 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.70)',
                            boxShadow: '0px 5.97px 5.97px 0px rgba(255, 255, 255, 0.25) inset',
                        }}
                    >
                        <div
                            className="h-full"
                            style={{
                                width: `${trumpRatePercent}%`,
                                background: 'linear-gradient(180deg, #F42C5D 0%, #6C001A 100%)',
                                boxShadow: '0px 5.97px 5.97px 0px rgba(255, 255, 255, 0.25) inset',
                            }}
                        />
                    </div>
                </>
            ) : null}
        </Link>
    );
}
