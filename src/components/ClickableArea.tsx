'use client';

import { createElement, forwardRef, type HTMLProps, type MouseEvent, type JSX } from 'react';

interface ClickableAreaProps extends HTMLProps<HTMLDivElement> {
    disabled?: boolean;
    as?: keyof JSX.IntrinsicElements;
}

export const ClickableArea = forwardRef(function ClickableArea(
    { as = 'div', children, disabled, onClick, ...props }: ClickableAreaProps,
    ref,
) {
    return createElement(
        as,
        {
            ...props,
            ref,
            onClick: (ev: MouseEvent<HTMLDivElement>) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (disabled) return;
                onClick?.(ev);
            },
        },
        children,
    );
});
