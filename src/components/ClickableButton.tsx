import type React from 'react';
import { forwardRef } from 'react';

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
