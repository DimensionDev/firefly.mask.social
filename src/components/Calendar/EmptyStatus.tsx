import { Trans } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<HTMLDivElement> {
    iconSize?: number;
}

export const EmptyStatus = memo(function EmptyStatus({ className, children, iconSize = 32, ...rest }: Props) {
    return (
        <div className={classNames('flex flex-col items-center justify-center p-[2px]', className)} {...rest}>
            <GhostHoleIcon width={100} height={70} className="text-third" />
            <p className="mt-1.5 text-second">{children ?? <Trans>There is no data available for display.</Trans>}</p>
        </div>
    );
});
