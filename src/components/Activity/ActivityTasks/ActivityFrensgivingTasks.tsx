'use client';

import { Trans } from '@lingui/macro';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityLoginButton } from '@/components/Activity/ActivityLoginButton.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { Source } from '@/constants/enum.js';
import type { Chars } from '@/helpers/chars.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';

export function ActivityFrensgivingTasks({ data }: { data: Pick<Required<ActivityInfoResponse>['data'], 'status'> }) {
    const shareContent: Chars = [];
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
                <ActivityConnectCard source={Source.Farcaster} />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Eligible for Premium Collectible?</Trans>
                </h2>
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton status={data.status} shareContent={shareContent as Chars} />
            </div>
        </>
    );
}
