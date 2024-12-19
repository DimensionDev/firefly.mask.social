'use client';

import { type ReactNode, useContext } from 'react';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityPremiumAddressVerifyButton } from '@/components/Activity/ActivityPremiumAddressVerifyButton.js';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import type { SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityPremiumAddressVerifyCard({
    source,
    label,
    chainId,
}: {
    source: SocialSource;
    label?: ReactNode;
    chainId: number;
}) {
    const { premiumAddress } = useContext(ActivityContext);
    return (
        <div
            className={classNames(
                'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-normal leading-6',
                premiumAddress ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
                {
                    'sm:flex-row sm:items-center sm:space-y-0': !premiumAddress,
                },
            )}
        >
            <ActivityVerifyText verified={!!premiumAddress}>
                <h3>{label}</h3>
            </ActivityVerifyText>
            <div className="ml-2 flex h-8 flex-shrink-0 space-x-2">
                <ActivityPremiumAddressVerifyButton source={source} chainId={chainId} />
            </div>
        </div>
    );
}
