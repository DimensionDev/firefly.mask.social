'use client';

import { type ReactNode, useContext } from 'react';

import { ActivityConnectButton } from '@/components/Activity/ActivityConnectButton.js';
import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import type { SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityConnectCard({
    source,
    label,
    chainId,
}: {
    source: SocialSource;
    label?: ReactNode;
    chainId: number;
}) {
    const { address } = useContext(ActivityContext);
    return (
        <div
            className={classNames(
                'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-normal leading-6',
                address ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
                {
                    'md:flex-row md:items-center md:space-y-0': !address,
                },
            )}
        >
            <ActivityVerifyText verified={!!address}>
                <h3>{label}</h3>
            </ActivityVerifyText>
            <div className="ml-2 flex h-8 flex-shrink-0 space-x-2">
                <ActivityConnectButton source={source} chainId={chainId} />
            </div>
        </div>
    );
}
