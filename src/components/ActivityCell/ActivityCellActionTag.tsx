'use client';

import { cloneElement, type HTMLProps, type PropsWithChildren, type ReactElement } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<'div'> {
    // eslint-disable-next-line
    icon: ReactElement;
}

export function ActivityCellActionTag({ icon, className, children }: PropsWithChildren<Props>) {
    return (
        <div
            className={classNames(
                className,
                'flex h-[22px] items-center whitespace-nowrap rounded-lg border border-main px-2 text-sm font-normal leading-[22px]',
            )}
        >
            {cloneElement(icon, { width: 12, height: 12, className: 'shrink-0 mr-1' })}
            {children}
        </div>
    );
}
