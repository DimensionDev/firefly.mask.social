import type { PropsWithChildren } from 'react';

import { classNames } from '@/helpers/classNames.js';

export function Button({
    onClick,
    disabled,
    children,
}: {
    onClick: () => void;
    disabled?: boolean;
    variant?: 'success' | 'error' | 'default';
} & PropsWithChildren) {
    const buttonStyle = disabled ? 'bg-main text-primaryBottom opacity-50' : 'bg-main text-primaryBottom';
    return (
        <button
            className={classNames(
                'text-text flex w-full items-center justify-center rounded-2xl px-6 py-3 font-semibold transition-colors motion-reduce:transition-none',
                buttonStyle,
            )}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
