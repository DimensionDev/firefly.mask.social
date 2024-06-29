'use client';
import ComeBackIcon from '@/assets/comeback.svg';
import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';
import { useComeBack } from '@/hooks/useComeback.js';

interface Props {
    params: {
        symbol: string;
    };
}

export default function TokenPage({ params }: Props) {
    const { symbol } = params;
    const comeback = useComeBack();
    return (
        <>
            <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-primaryBottom px-4">
                <div className="flex items-center gap-7">
                    <ComeBackIcon className="cursor-pointer text-lightMain" onClick={comeback} />
                    <span className="text-xl font-black text-lightMain">${symbol}</span>
                </div>
            </div>
            <TokenDetail symbol={symbol} />
        </>
    );
}
