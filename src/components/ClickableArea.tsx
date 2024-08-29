import { createElement } from 'react';

interface ClickableAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    as?: keyof JSX.IntrinsicElements;
    children?: React.ReactNode;
    onClick?: (ev: React.MouseEvent) => void;
}

export function ClickableArea({ as = 'div', children, disabled, onClick, ...props }: ClickableAreaProps) {
    return createElement(
        as,
        {
            ...props,
            onClick: (ev: React.MouseEvent) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (disabled) return;
                onClick?.(ev);
            },
        },
        children,
    );
}
