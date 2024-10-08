'use client';

import { createElement, forwardRef } from 'react';

interface ClickableAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    as?: keyof JSX.IntrinsicElements;
    children?: React.ReactNode;
    onClick?: (ev: React.MouseEvent) => void;
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
            onClick: (ev: React.MouseEvent) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (disabled) return;
                onClick?.(ev);
            },
        },
        children,
    );
});
