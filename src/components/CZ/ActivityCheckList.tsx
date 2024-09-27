'use client';

import { Trans } from '@lingui/macro';

import CircleFailIcon from '@/assets/circle-fail.svg';
import CircleSuccessIcon from '@/assets/circle-success.svg';
import FollowIcon from '@/assets/follow.svg';
import { ActivityClaimButton } from '@/components/CZ/ActivityClaimButton.js';
import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

export function ActivityCheckList() {
    const { data, isLoading } = useActivityCheckResponse();
    const basicChecklist = [
        {
            icon: <FollowIcon width={16} height={16} />,
            description: (
                <Trans>
                    Followed{' '}
                    <Link className="text-[#AC9DF6]" href={resolveProfileUrl(Source.Twitter, '902926941413453824')}>
                        @cz_binance
                    </Link>{' '}
                    on X before Sept 21
                </Trans>
            ),
            pass: data?.x?.valid,
        },
    ];
    const premiumChecklist = [
        {
            description: <Trans>Your X account holds Premium status.</Trans>,
            pass: data?.x?.hasVerified,
        },
        {
            description: <Trans>Your BNB Chain wallet holds assets worth over $10,000.</Trans>,
            pass: data?.bnbBalance?.valid,
        },
        {
            description: <Trans>Your .bnb domain is a member of the SPACE ID Premier Club.</Trans>,
            pass: data?.bnbId?.valid,
        },
    ];

    return (
        <div className="flex w-full flex-col space-y-8 text-left">
            <div className="space-y-4">
                <h5 className="text-md font-bold text-[#AC9DF6]">
                    <Trans>Basic Criteria</Trans>
                </h5>
                <p>
                    <Trans>To be eligible for the airdrop, fulfill the following criteria:</Trans>
                </p>
                <ul className="flex w-full flex-col items-center space-y-3 text-sm font-bold text-white/80">
                    {basicChecklist.map((item, i) => (
                        <li key={i} className="flex w-full items-center justify-between">
                            <p>{item.description}</p>
                            <div>
                                {item.pass ? (
                                    <CircleSuccessIcon className="ml-auto h-4 w-4" />
                                ) : (
                                    <CircleFailIcon className="ml-auto h-4 w-4" />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-4">
                <h5 className="text-md font-bold">
                    <Trans>Premium Criteria</Trans>
                </h5>
                <p>
                    <Trans>
                        In addition to meeting the Basic Criteria, fulfill any of the following to upgrade to a premium
                        NFT:
                    </Trans>
                </p>
                <ul className="flex w-full flex-col items-center space-y-3 text-sm font-bold text-white/80">
                    {premiumChecklist.map((item, i) => (
                        <li key={i} className="flex w-full items-center justify-between">
                            <p>{item.description}</p>
                            <div>
                                {item.pass ? (
                                    <CircleSuccessIcon className="ml-auto h-4 w-4" />
                                ) : (
                                    <CircleFailIcon className="ml-auto h-4 w-4" />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <ActivityClaimButton
                level={data?.level}
                alreadyClaimed={data?.alreadyClaimed}
                canClaim={data?.canClaim}
                isLoading={isLoading}
                className="!w-full"
            />
        </div>
    );
}
