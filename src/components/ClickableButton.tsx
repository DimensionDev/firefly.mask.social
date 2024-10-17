'use client';

import type React from 'react';
import { forwardRef, type HTMLProps } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface ClickableButtonProps extends HTMLProps<HTMLButtonElement> {
    enableDefault?: boolean;
    enablePropagate?: boolean;
    enableOutline?: boolean;
}

export const ClickableButton = forwardRef<HTMLButtonElement, ClickableButtonProps>(function ClickableButton(
    { enableDefault = false, enablePropagate = false, enableOutline = false, children, onClick, ...props },
    ref,
) {
    return (
        <button
            {...props}
            type={props.type as 'button'}
            className={classNames(props.className, {
                'outline-none': !enableOutline,
                'disabled:cursor-not-allowed disabled:opacity-50': !!props.disabled,
            })}
            ref={ref}
            onClick={(event) => {
                if (props.disabled) return;
                if (!enableDefault) event.preventDefault();
                if (!enablePropagate) event.stopPropagation();
                onClick?.(event);
            }}
        >
            {children}
        </button>
    );
});
