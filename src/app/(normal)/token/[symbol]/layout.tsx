import type { PropsWithChildren } from 'react';

import { Comeback } from '@/components/Comeback.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getTokenFromCoinGecko } from '@/services/getTokenFromCoinGecko.js';

interface Props {
    params: {
        symbol: string;
    };
}

export default async function TokenPageLayout({ params, children }: PropsWithChildren<Props>) {
    const symbol = decodeURIComponent(params.symbol);
    const token = await runInSafeAsync(() => getTokenFromCoinGecko(symbol));

    return (
        <>
            <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-primaryBottom px-4">
                <div className="flex items-center gap-7">
                    <Comeback className="cursor-pointer text-lightMain" />
                    <span className="text-xl font-black text-lightMain">${token?.symbol || symbol}</span>
                </div>
            </div>
            {children}
        </>
    );
}
