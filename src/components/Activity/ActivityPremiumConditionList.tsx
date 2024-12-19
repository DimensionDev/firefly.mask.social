'use client';

import type { PropsWithChildren, ReactNode } from 'react';

import { ActivityVerifyText } from '@/components/Activity/ActivityVerifyText.js';
import { useActivityPremiumList } from '@/components/Activity/hooks/useActivityPremiumList.js';
import type { SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

export function ActivityPremiumConditionList({
    title,
    source,
    children,
}: PropsWithChildren<{ title: ReactNode; source: SocialSource }>) {
    const list = useActivityPremiumList(source);

    return (
        <div
            className={classNames(
                'flex w-full flex-col space-y-2 rounded-2xl p-3 text-sm font-semibold leading-6',
                list.some((x) => x.verified) ? 'bg-success/10 dark:bg-success/20' : 'bg-bg',
            )}
        >
            <h3>{title}</h3>
            <ul className="list-disc pl-4 text-sm font-normal leading-6">
                {list.map((item, i) => (
                    <li key={i}>
                        <ActivityVerifyText verified={item.verified}>{item.label}</ActivityVerifyText>
                    </li>
                ))}
            </ul>
            {children}
        </div>
    );
}
