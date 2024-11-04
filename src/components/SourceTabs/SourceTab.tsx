'use client';

import type { LinkProps } from 'next/link.js';
import { memo, type PropsWithChildren, useLayoutEffect, useRef } from 'react';

import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';

interface SourceTabProps extends PropsWithChildren<LinkProps> {
    isActive: boolean;
    className?: string;
}

export const SourceTab = memo(function SourceTab({ isActive, ...rest }: SourceTabProps) {
    const tabRef = useRef<HTMLAnchorElement>(null);
    useLayoutEffect(() => {
        if (isActive && tabRef.current) {
            tabRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isActive]);
    return (
        <Link
            className={classNames(
                'h-[43px] cursor-pointer border-b-4 px-4 text-center font-bold leading-[43px] active:bg-main/10 md:h-[60px] md:py-[18px] md:leading-6 md:hover:text-highlight',
                isActive ? 'border-highlight text-highlight' : 'border-transparent text-third',
            )}
            aria-current={isActive ? 'page' : undefined}
            ref={tabRef}
            {...rest}
        />
    );
});
