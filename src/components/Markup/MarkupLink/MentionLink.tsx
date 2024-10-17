'use client';

import type { LinkProps } from 'next/link.js';
import { forwardRef, memo } from 'react';

import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { stopPropagation } from '@/helpers/stopEvent.js';

interface Props extends LinkProps {
    handle: string;
    className?: string;
}

export const MentionLink = memo(
    forwardRef<HTMLAnchorElement, Props>(function MentionLink({ handle, className, ...rest }, ref) {
        if (!handle) return null;
        return (
            <Link className={classNames('text-highlight', className)} {...rest} onClick={stopPropagation} ref={ref}>
                @{handle}
            </Link>
        );
    }),
);
