'use client';

import { Trans } from '@lingui/macro';
import { useContext } from 'react';

import { ActivityConnectButton } from '@/components/Activity/ActivityConnectButton.js';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityConnectCard() {
    const { address } = useContext(ActivityContext);
    return (
        <div
            className={classNames(
                'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-semibold leading-6',
                address ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
                {
                    'sm:flex-row sm:items-center sm:space-y-0': !address,
                },
            )}
        >
            <ActivityVerifyText verified={!!address}>
                <h3>
                    <Trans>Submit claimed address</Trans>
                </h3>
            </ActivityVerifyText>
            <div className="flex h-8 flex-shrink-0 space-x-2">
                <ActivityConnectButton />
            </div>
        </div>
    );
}
