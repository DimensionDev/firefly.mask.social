import React, { memo } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    delimiter?: boolean;
    children?: React.ReactNode;
}

export const PageTitle = memo(function PageTitle({ delimiter = true, children, ...props }: PageTitleProps) {
    return (
        <h2
            className={classNames('p-4 text-xl font-bold leading-snug text-main', {
                'border-b border-line': delimiter,
            })}
            {...props}
        >
            {children}
        </h2>
    );
});
