import React, { memo } from 'react';

interface AsideTitleProps {
    children?: React.ReactNode;
}

export const AsideTitle = memo(function AsideTitle({ children }: AsideTitleProps) {
    return <h2 className="p-4 text-xl font-bold leading-none">{children}</h2>;
});
