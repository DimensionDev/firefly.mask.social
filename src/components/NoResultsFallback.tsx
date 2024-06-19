import { Trans } from '@lingui/macro';
import type { HTMLProps, ReactNode } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';
import { classNames } from '@/helpers/classNames.js';

export interface NoResultsFallbackProps extends HTMLProps<HTMLDivElement> {
    message?: string | ReactNode;
    icon?: ReactNode;
}

export function NoResultsFallback({ icon, message, className, ...rest }: NoResultsFallbackProps) {
    return (
        <div className={classNames('flex flex-col items-center py-12 text-secondary', className)} {...rest}>
            {icon ?? <GhostHoleIcon width={200} height={143} className="text-third" />}
            <div className="mt-3 break-words break-all text-center text-[15px] font-bold">
                {message ?? (
                    <div className="mt-10">
                        <Trans>There is no data available for display.</Trans>
                    </div>
                )}
            </div>
        </div>
    );
}
