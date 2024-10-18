'use client';

import { Trans } from '@lingui/macro';

import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityPremiumConditionList() {
    const list = useActivityPremiumList();

    return (
        <div className="flex w-full flex-col space-y-2 text-sm font-semibold leading-6">
            <h2 className="text-base font-semibold leading-6">
                <Trans>Final Step Claim Now!</Trans>
            </h2>
            <div
                className={classNames(
                    'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-semibold leading-6',
                    list.some((x) => x.verified) ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
                )}
            >
                <h3>
                    <Trans>
                        Hold on, in addition to meeting above criteria, fulfill any of the following to upgrade to a
                        premium airdrop
                    </Trans>
                </h3>
                <ul className="list-disc pl-4 text-sm font-medium leading-6">
                    {list.map((item, i) => (
                        <li key={i}>
                            <ActivityVerifyText verified={item.verified}>{item.label}</ActivityVerifyText>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
