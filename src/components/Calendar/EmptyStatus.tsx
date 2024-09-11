import { Trans } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import GhostHoleIcon from '@/assets/ghost.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<HTMLDivElement> {}

export const EmptyStatus = memo(function EmptyStatus({ className, children, ...rest }: Props) {
    return (
        <div
            className={classNames(
                'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center gap-3 whitespace-nowrap p-[2px] text-second',
                className,
            )}
            {...rest}
        >
            <GhostHoleIcon width={100} height={70} className="text-third" />
            <p className="mt-1.5 text-second">{children ?? <Trans>There is no data available for display.</Trans>}</p>
        </div>
    );
});
