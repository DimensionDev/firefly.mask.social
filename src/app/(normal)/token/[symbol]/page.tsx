import { TokenDetail } from '@/components/TokenProfile/TokenDetail.js';
import { KeyType } from '@/constants/enum.js';
import { createMetadataToken } from '@/helpers/createMetadataToken.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createPageMetadata = memoizeWithRedis(createMetadataToken, {
    key: KeyType.CreateMetadataToken,
});

interface Props {
    params: Promise<{
        symbol: string;
    }>;
}

export async function generateMetadata(props: Props) {
    const params = await props.params;
    return createPageMetadata(params.symbol);
}

export default async function TokenPage(props: Props) {
    const params = await props.params;
    const { symbol } = params;
    return <TokenDetail symbol={symbol} />;
}
