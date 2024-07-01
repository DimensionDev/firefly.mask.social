'use client';
import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';

interface Props {
    params: {
        symbol: string;
    };
}

export default function TokenPage({ params }: Props) {
    const { symbol } = params;
    return <TokenDetail symbol={symbol} />;
}
