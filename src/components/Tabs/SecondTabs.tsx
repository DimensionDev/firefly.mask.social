import type React from 'react';

import { Link } from '@/components/Link.js';
import { classNames } from '@/helpers/classNames.js';

interface SecondTabsProps<T extends keyof any> {
    items: Array<{
        title: React.ReactNode;
        link: string;
        value: T;
    }>;
    current: T;
}

export function SecondTabs<T extends keyof any>({ items, current }: SecondTabsProps<T>) {
    return (
        <nav className="border-b border-line bg-primaryBottom px-4">
            <menu className="scrollable-tab -mb-px flex gap-1.5 md:w-full" aria-label="Tabs">
                {items.map((tab) => {
                    return (
                        <li key={tab.link} className="flex flex-1 list-none justify-center">
                            <Link
                                replace
                                href={tab.link}
                                className={classNames(
                                    current === tab.value ? 'border-b-4 border-highlight text-highlight' : 'text-third',
                                    'h-[45px] px-4 text-center text-base font-bold leading-[45px] hover:cursor-pointer hover:text-highlight',
                                )}
                            >
                                {tab.title}
                            </Link>
                        </li>
                    );
                })}
            </menu>
        </nav>
    );
}
