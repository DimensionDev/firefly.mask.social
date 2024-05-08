import React, { memo } from 'react';

interface AsideTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
}

export const AsideTitle = memo(function AsideTitle({ children, ...props }: AsideTitleProps) {
    return (
        <h2 className="p-4 text-lg font-bold leading-none" {...props}>
            {children}
        </h2>
    );
});
