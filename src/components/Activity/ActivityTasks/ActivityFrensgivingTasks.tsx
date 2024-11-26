'use client';

import { Trans } from '@lingui/macro';
import urlcat from 'urlcat';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityLoginButton } from '@/components/Activity/ActivityLoginButton.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import type { Chars } from '@/helpers/chars.js';
import { ReferralAccountPlatform, resolveActivityUrl } from '@/helpers/resolveActivityUrl.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';

export function ActivityFrensgivingTasks({
    data,
}: {
    data: Pick<Required<ActivityInfoResponse>['data'], 'status' | 'name'>;
}) {
    const farcasterHandle = '';
    const shareUrl = urlcat(
        SITE_URL,
        resolveActivityUrl(data.name, { referralCode: farcasterHandle, platform: ReferralAccountPlatform.Farcaster }),
    );
    const shareContent: Chars = [
        'Just earned $ANON by minting the Firefly Farcaster Frensgiving 🦃✨ collectible from @thefireflyapp\n\nClaim here ',
        shareUrl,
        ' \n\n #Frensgiving #Thanksgiving #Farcaster #FireflySocial',
    ];
    return (
        <>
            <div className="mb-4 w-full space-y-4 px-6 py-4">
                <div className="flex w-full flex-col space-y-2">
                    <div className="flex h-8 items-center justify-between">
                        <h2 className="text-base font-semibold leading-6">
                            <Trans>Check eligibility</Trans>
                        </h2>
                        <ActivityLoginButton source={Source.Farcaster} />
                    </div>
                </div>
                <div className="flex w-full flex-col space-y-2 rounded-2xl bg-bg p-3 text-sm font-semibold leading-6">
                    <Trans>
                        Available to Farcaster ID under 100,000 or users of select third-party Farcaster apps as of our
                        snapshot
                    </Trans>
                </div>
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Follow & Submit</Trans>
                </h2>
                <ActivityTaskFollowCard handle="fireflyapp" source={Source.Farcaster} profileId="16823" />
                <ActivityConnectCard
                    source={Source.Farcaster}
                    label={<Trans>Submit a wallet to receive NFT and $ANON</Trans>}
                />
                <div className="flex w-full flex-col space-y-2 text-sm font-semibold leading-6">
                    <h2 className="text-base font-semibold leading-6">
                        <Trans>Eligible for Premium Collectible?</Trans>
                    </h2>
                    <ActivityPremiumConditionList
                        title={
                            <Trans>Meet any of the following to unlock a premium collectible and get more $ANON:</Trans>
                        }
                    />
                </div>
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton status={data.status} shareContent={shareContent as Chars} />
            </div>
        </>
    );
}
