'use client';

import { useQuery } from '@tanstack/react-query';

import { Link } from '@/esm/Link.js';
import { useIsMedium, useIsSmall } from '@/hooks/useMediaQuery.js';

interface VotingResultBannerProps {
    trumpRate: number;
}

export function VotingResultBanner({ trumpRate }: VotingResultBannerProps) {
    const isSmall = useIsSmall('max');
    const isMedium = useIsMedium('max');

    // wait for image to load before showing the percentage
    const { isLoading } = useQuery({
        queryKey: ['voting-bg'],
        staleTime: 10 * 60 * 1000,
        queryFn: () =>
            new Promise((resolve) => {
                try {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);

                    img.src = '/image/voting-bg.png';
                } catch {
                    resolve(null);
                }
            }),
    });

    const strokeWidth = isSmall ? 2 : isMedium ? 3 : 3.5;

    const trumpRatePercent = Math.round(trumpRate * 100);
    const HarrisRatePercent = 100 - trumpRatePercent;

    const showPercent = !isLoading;

    return (
        <Link className="relative w-full" href={'/event/elex24'}>
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
                                className="text-[16px] sm:text-[24px] md:text-[29px]"
                                style={{ WebkitTextStrokeWidth: strokeWidth, WebkitTextStrokeColor: '#B8133B' }}
                            >
                                {trumpRatePercent}
                            </span>
                            <span
                                className="-ml-1 text-[16px] sm:text-[24px] md:text-[29px]"
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
                                className="text-[16px] sm:text-[24px] md:text-[29px]"
                                style={{ WebkitTextStrokeWidth: strokeWidth, WebkitTextStrokeColor: '#0F53A4' }}
                            >
                                {HarrisRatePercent}
                            </span>
                            <span
                                className="-ml-1 text-[16px] sm:text-[24px] md:text-[29px]"
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
