import { createElement, type JSXElementConstructor } from 'react';

interface ClickableArea extends React.HTMLAttributes<HTMLDivElement> {
    as?: keyof JSX.IntrinsicElements | JSXElementConstructor<any>;
    children: React.ReactNode;
    onClick?: () => void;
}

export function ClickableArea({ as = 'div', children, onClick, ...props }: ClickableArea) {
    return createElement(
        as,
        {
            ...props,
            onClick: (ev: React.MouseEvent) => {
                ev.preventDefault();
                ev.stopPropagation();
                onClick?.();
            },
        },
        children,
    );
}
