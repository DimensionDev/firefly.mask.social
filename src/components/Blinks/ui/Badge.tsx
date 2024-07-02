import type { HTMLProps, ReactNode } from 'react';

import { classNames } from '@/helpers/classNames.js';

type BadgeVariant = 'warning' | 'error' | 'default';

interface Props extends HTMLProps<HTMLDivElement> {
    variant?: BadgeVariant;
    icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
    error: 'bg-danger/10 text-twitter-error hover:text-twitter-error-lighter hover:bg-[#F62D2D1A] transition-colors motion-reduce:transition-none',
    warning:
        'bg-warn/10 text-twitter-warning hover:text-twitter-warning-lighter transition-colors motion-reduce:transition-none',
    default: 'bg-[#B3B3B31A] text-[#888989] hover:text-[#949CA4] transition-colors motion-reduce:transition-none',
};

export function Badge({ variant = 'default', children, className, icon }: Props) {
    return (
        <div
            className={classNames(
                variantClasses[variant],
                'text-subtext inline-flex items-center justify-center gap-1 rounded-full font-semibold leading-none',
                className,
                {
                    'aspect-square p-1': !children && !!icon,
                    'px-1.5 py-1': !!children,
                },
            )}
        >
            {children ? <div>{children}</div> : null}
            {icon ? <div>{icon}</div> : null}
        </div>
    );
}
