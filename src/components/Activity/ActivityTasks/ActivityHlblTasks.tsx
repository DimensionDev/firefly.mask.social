'use client';

import { Trans } from '@lingui/macro';

import { ActivityClaimButton } from '@/components/Activity/ActivityClaimButton.js';
import { ActivityConnectCard } from '@/components/Activity/ActivityConnectCard.js';
import { ActivityFollowTargetCard } from '@/components/Activity/ActivityFollowTargetCard.js';
import { ActivityPremiumConditionList } from '@/components/Activity/ActivityPremiumConditionList.js';
import { ActivityTaskFollowCard } from '@/components/Activity/ActivityTaskFollowCard.js';
import { ActivityTwitterLoginButton } from '@/components/Activity/ActivityTwitterLoginButton.js';
import { Source } from '@/constants/enum.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';
import { useContext } from 'react';
import { ActivityElex24Context } from '@/components/Activity/ActivityElex24/ActivityElex24Context.js';

export function ActivityHlblTasks({ data }: { data: Pick<Required<ActivityInfoResponse>['data'], 'status'> }) {
    const { vote } = useContext(ActivityElex24Context);
    return (
        <>
            <div className="w-full space-y-4 px-6 pt-4">
                <div className="flex w-full flex-col space-y-2">
                    <div className="flex h-8 items-center justify-between">
                        <h2 className="text-base font-semibold leading-6">
                            <Trans>Step 1 Sign in</Trans>
                        </h2>
                        <ActivityTwitterLoginButton />
                    </div>
                    <ActivityFollowTargetCard handle="brian_armstrong" profileId="14379660" />
                </div>
                <ActivityTaskFollowCard
                    handle="thefireflyapp"
                    source={Source.Twitter}
                    profileId="1583361564479889408"
                />
                <h2 className="text-base font-semibold leading-6">
                    <Trans>Step 2 Connect Wallet</Trans>
                </h2>
                <ActivityConnectCard />
                <ActivityPremiumConditionList />
            </div>
            <div className="sticky bottom-0 mt-auto w-full bg-primaryBottom px-4 pt-1.5 pb-safe-or-4 sm:pb-safe-or-2">
                <ActivityClaimButton status={data.status} claimApiExtraParams={{ vote }} />
            </div>
        </>
    );
}
