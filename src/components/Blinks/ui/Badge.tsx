import type { HTMLProps, ReactNode } from 'react';

import { classNames } from '@/helpers/classNames.js';

type BadgeVariant = 'warning' | 'error' | 'default';

interface Props extends HTMLProps<HTMLDivElement> {
    variant?: BadgeVariant;
    icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
    error: 'bg-danger/10 text-danger hover:bg-danger/20',
    warning: 'bg-warn/10 text-warn hover:bg-warn/20',
    default: 'bg-main/10 text-main hover:bg-main/20',
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
