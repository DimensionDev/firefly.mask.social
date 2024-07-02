'use client';
import { useParams } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import ComeBackIcon from '@/assets/comeback.svg';
import { useComeBack } from '@/hooks/useComeback.js';

export default function TokenPageLayout({ children }: PropsWithChildren) {
    const params = useParams<{ symbol: string }>();
    const symbol = decodeURIComponent(params.symbol);
    const comeback = useComeBack();
    return (
        <>
            <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-primaryBottom px-4">
                <div className="flex items-center gap-7">
                    <ComeBackIcon className="cursor-pointer text-lightMain" onClick={comeback} />
                    <span className="text-xl font-black text-lightMain">${symbol}</span>
                </div>
            </div>
            {children}
        </>
    );
}
