import type { PropsWithChildren } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
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
        <ClickableButton
            className={classNames(
                'flex h-10 w-full items-center justify-center rounded-full px-5 text-sm font-bold leading-10',
                buttonStyle,
            )}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </ClickableButton>
    );
}
