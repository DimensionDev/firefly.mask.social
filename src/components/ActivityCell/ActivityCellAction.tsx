'use client';

import type { HTMLProps } from 'react';

import { classNames } from '@/helpers/classNames.js';

export function ActivityCellAction({ children, className }: HTMLProps<'div'>) {
    return (
        <div
            className={classNames(
                className,
                'flex h-6 max-w-[100%] items-center space-x-1 text-sm font-normal leading-6',
            )}
        >
            {children}
        </div>
    );
}
