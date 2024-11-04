'use client';

import type { LinkProps } from 'next/link.js';
import type { PropsWithChildren } from 'react';

import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';

interface SourceTabProps extends PropsWithChildren<LinkProps> {
    isActive: boolean;
    className?: string;
}

export function SourceTab({ isActive, ...rest }: SourceTabProps) {
    return (
        <Link
            className={classNames(
                'h-[43px] cursor-pointer border-b-2 px-4 text-center font-bold leading-[43px] active:bg-main/10 md:h-[60px] md:py-[18px] md:leading-6 md:hover:text-main',
                isActive ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
            )}
            aria-current={isActive ? 'page' : undefined}
            ref={(node) => {
                if (isActive && node) {
                    node.scrollIntoView({ behavior: 'smooth' });
                }
            }}
            {...rest}
        />
    );
}
