import type React from 'react';
import { forwardRef } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface ClickableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClick?: () => void;
}

export const ClickableButton = forwardRef<HTMLButtonElement, ClickableButtonProps>(function ClickableButton(
    { children, onClick, ...props },
    ref,
) {
    return (
        <button
            {...props}
            className={classNames(props.className, 'disabled:cursor-not-allowed disabled:opacity-50')}
            ref={ref}
            onClick={(ev) => {
                if (props.disabled) return;
                ev.preventDefault();
                ev.stopPropagation();
                onClick?.();
            }}
        >
            {children}
        </button>
    );
});
