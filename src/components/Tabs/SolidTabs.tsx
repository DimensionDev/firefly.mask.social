'use client';

import type { ReactNode } from 'react';

import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';

interface SolidTabsProps<T> {
    data: T[];
    link?: (value: T) => string;
    isSelected: (value: T) => boolean;
    itemRender: (value: T) => ReactNode;
    onChange?: (value: T) => void;
}

export function SolidTabs<T = unknown>({ data, link, isSelected, itemRender, onChange }: SolidTabsProps<T>) {
    return (
        <div>
            <ul className="no-scrollbar relative inline-flex h-10 max-w-full items-center overflow-y-auto rounded-md border border-lightLineSecond bg-lightBottom px-[5px] py-1 dark:bg-darkBottom">
                {data.map((value, index) => {
                    const isActive = isSelected(value);
                    const className = classNames(
                        'inline-flex h-8 cursor-pointer items-center rounded px-3 text-sm font-medium transition-colors hover:text-highlight',
                        {
                            'bg-transparent text-lightSecond': !isActive,
                            'bg-lightBg text-highlight': isActive,
                        },
                    );

                    return (
                        <li key={index} className="shrink-0" aria-current={isActive ? 'page' : undefined}>
                            {link ? (
                                <Link className={className} href={link(value)}>
                                    {itemRender(value)}
                                </Link>
                            ) : (
                                <span className={className}>{itemRender(value)}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
