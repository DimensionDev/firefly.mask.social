import type { PropsWithChildren } from 'react';

import TickSquareIcon from '@/assets/tick-square.svg';

export function ActivityVerifyText({ verified, children }: PropsWithChildren<{ verified?: boolean }>) {
    return (
        <div className="flex w-full justify-between space-x-2">
            {children}
            {verified ? <TickSquareIcon className="h-6 w-6 shrink-0 text-success" /> : null}
        </div>
    );
}
