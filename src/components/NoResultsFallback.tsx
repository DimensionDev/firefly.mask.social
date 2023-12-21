import { Trans } from '@lingui/macro';
import type { HTMLProps, ReactNode } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<HTMLDivElement> {
    message?: string | ReactNode;
    icon?: ReactNode;
}
export function NoResultsFallback({ icon, message, className, ...rest }: Props) {
    return (
        <div className={classNames('flex flex-col items-center py-12 text-secondary', className)} {...rest}>
            {icon}
            <div className="mt-3 break-words break-all text-center text-[15px] font-bold">
                {message ?? <Trans>No results</Trans>}
            </div>
        </div>
    );
}
