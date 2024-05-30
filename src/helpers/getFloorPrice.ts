import { first } from 'lodash-es';

// eslint-disable-next-line no-restricted-imports
import { formatBalance } from '@/maskbook/packages/web3-shared/base/src/helpers/formatBalance.js';

export function getFloorPrice<
    F extends { value: number | string; payment_token: { decimals: number; symbol: string } },
>(floorPrices?: F[]) {
    const firstFloorPrice = first(floorPrices);
    if (!firstFloorPrice) return;

    return `${formatBalance(firstFloorPrice.value, firstFloorPrice.payment_token.decimals)} ${
        firstFloorPrice.payment_token.symbol
    }`;
}
