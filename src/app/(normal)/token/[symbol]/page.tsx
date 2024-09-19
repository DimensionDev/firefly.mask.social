import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';
import { getTokenPageOG } from '@/helpers/getTokenPageOG.js';

export const revalidate = 60;

interface Props {
    params: {
        symbol: string;
    };
}

export async function generateMetadata({ params }: Props) {
    return getTokenPageOG(params.symbol);
}

export default function TokenPage({ params }: Props) {
    const { symbol } = params;
    return <TokenDetail symbol={symbol} />;
}
