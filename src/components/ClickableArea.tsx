import { createElement } from 'react';

interface ClickableArea extends React.HTMLAttributes<HTMLDivElement> {
    as?: keyof JSX.IntrinsicElements;
    children?: React.ReactNode;
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
