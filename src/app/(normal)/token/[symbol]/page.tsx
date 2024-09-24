import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';
import { KeyType } from '@/constants/enum.js';
import { createTokenPageMetadata } from '@/helpers/createPageMetadata.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createTokenPageMetadataRedis = memoizeWithRedis(createTokenPageMetadata, {
    key: KeyType.CreateTokenPageMetadata,
});

interface Props {
    params: {
        symbol: string;
    };
}

export async function generateMetadata({ params }: Props) {
    return createTokenPageMetadataRedis(params.symbol);
}

export default function TokenPage({ params }: Props) {
    const { symbol } = params;
    return <TokenDetail symbol={symbol} />;
}
