import type React from 'react';
import { forwardRef } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface ClickableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    enableDefault?: boolean;
    enablePropagate?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}

export const ClickableButton = forwardRef<HTMLButtonElement, ClickableButtonProps>(function ClickableButton(
    { enableDefault = false, enablePropagate = false, children, onClick, ...props },
    ref,
) {
    return (
        <button
            {...props}
            className={classNames('disabled:cursor-not-allowed disabled:opacity-50', props.className)}
            ref={ref}
            onClick={(ev) => {
                if (props.disabled) return;
                if (!enableDefault) ev.preventDefault();
                if (!enablePropagate) ev.stopPropagation();
                onClick?.();
            }}
        >
            {children}
        </button>
    );
});
