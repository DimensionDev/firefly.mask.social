import React, { memo } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface AsideTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
}

export const AsideTitle = memo(function AsideTitle({ children, className, ...props }: AsideTitleProps) {
    return (
        <h2 className={classNames('p-4 text-lg font-bold leading-none', className)} {...props}>
            {children}
        </h2>
    );
});
