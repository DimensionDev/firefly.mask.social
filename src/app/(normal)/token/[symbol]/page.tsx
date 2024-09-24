import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';
import { KeyType } from '@/constants/enum.js';
import { createMetadataToken } from '@/helpers/createMetadataToken.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createPageMetadata = memoizeWithRedis(createMetadataToken, {
    key: KeyType.CreateMetadataToken,
});

interface Props {
    params: {
        symbol: string;
    };
}

export async function generateMetadata({ params }: Props) {
    return createPageMetadata(params.symbol);
}

export default function TokenPage({ params }: Props) {
    const { symbol } = params;
    return <TokenDetail symbol={symbol} />;
}
