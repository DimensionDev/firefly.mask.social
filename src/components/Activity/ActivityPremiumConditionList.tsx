'use client';

import { Trans } from '@lingui/macro';

import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Level } from '@/providers/types/CZ.js';

export function ActivityPremiumConditionList() {
    const { data } = useActivityClaimCondition(); // TODO
    return (
        <div className="flex w-full flex-col space-y-2 text-sm font-semibold leading-6">
            <h2 className="text-base font-semibold leading-6">
                <Trans>Final Step Claim Now!</Trans>
            </h2>
            <div className="flex w-full flex-col space-y-2 rounded-2xl bg-bg p-3 text-sm font-semibold leading-6">
                <h3>
                    <Trans>
                        Hold on, in addition to meeting above criteria, fulfill any of the following to upgrade to a
                        premium airdrop
                    </Trans>
                </h3>
                <ul className="list-disc pl-4 text-sm font-medium leading-6">
                    <li>
                        <ActivityVerifyText verified={data?.x?.level === Level.Lv2}>
                            <Trans>X Premium account</Trans>
                        </ActivityVerifyText>
                    </li>
                    <li>
                        <ActivityVerifyText
                            verified={data?.bnbId?.level === Level.Lv2} // TODO: Base Chain assets
                        >
                            <Trans>Hold ≥ $10k Base Chain asset</Trans>
                        </ActivityVerifyText>
                    </li>
                    <li>
                        <Trans>Share this activity on social media</Trans>
                    </li>
                </ul>
            </div>
        </div>
    );
}
