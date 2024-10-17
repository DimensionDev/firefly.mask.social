import type { PropsWithChildren } from 'react';

import TickSquareIcon from '@/assets/tick-square.svg';

export function ActivityVerifyText({ verified, children }: PropsWithChildren<{ verified?: boolean }>) {
    return (
        <div className="flex w-full justify-between space-x-2">
            <h2 className="text-base font-semibold leading-6">{children}</h2>
            {verified ? <TickSquareIcon className="h-4 w-4 shrink-0 text-success" /> : null}
        </div>
    );
}
