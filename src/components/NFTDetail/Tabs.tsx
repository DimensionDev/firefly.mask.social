'use client';

import { t } from '@lingui/macro';

import { classNames } from '@/helpers/classNames.js';

const tabs = [
    {
        label: t`Overflow`,
        value: 'overflow',
    },
    {
        label: t`Properties`,
        value: 'properties',
    },
] as const;

export type Tab = (typeof tabs)[number]['value'];

export interface TabsProps {
    onChange?: (tab: Tab) => void;
    currentTab: Tab;
}

export function Tabs({ currentTab, onChange }: TabsProps) {
    return (
        <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map(({ value, label }) => (
                <li key={value} className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
                    <a
                        className={classNames(
                            currentTab === value ? 'border-b-2 border-[#9250FF] text-main' : 'text-third',
                            'h-[43px] px-4 text-center text-xl font-bold leading-[43px] hover:cursor-pointer hover:text-main',
                            'md:h-[60px] md:py-[18px] md:leading-6',
                        )}
                        aria-current={currentTab === value ? 'page' : undefined}
                        onClick={() => onChange?.(value)}
                    >
                        {label}
                    </a>
                </li>
            ))}
        </nav>
    );
}
