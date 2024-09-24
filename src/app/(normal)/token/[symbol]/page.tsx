import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';
import { KeyType } from '@/constants/enum.js';
import { getTokenPageOG } from '@/helpers/getTokenPageOG.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const getTokenPageOGRedis = memoizeWithRedis(getTokenPageOG, {
    key: KeyType.GetTokenPageOG,
});

interface Props {
    params: {
        symbol: string;
    };
}

export async function generateMetadata({ params }: Props) {
    return getTokenPageOGRedis(params.symbol);
}

export default function TokenPage({ params }: Props) {
    const { symbol } = params;
    return <TokenDetail symbol={symbol} />;
}
