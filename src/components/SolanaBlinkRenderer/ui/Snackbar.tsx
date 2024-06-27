import type { ReactNode } from 'react';

import { classNames } from '@/helpers/classNames.js';

type SnackbarVariant = 'warning' | 'error';

interface Props {
    variant?: SnackbarVariant;
    children: ReactNode | ReactNode[];
}

const variantClasses: Record<SnackbarVariant, string> = {
    error: 'bg-twitter-error/10 text-twitter-error border-twitter-error',
    warning: 'bg-twitter-warning/10 text-twitter-warning border-twitter-warning',
};

export function Snackbar({ variant = 'warning', children }: Props) {
    return <div className={classNames(variantClasses[variant], 'text-subtext rounded-lg border p-3')}>{children}</div>;
}
