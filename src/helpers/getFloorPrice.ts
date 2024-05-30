import { formatBalance } from '@masknet/web3-shared-base';
import { first } from 'lodash-es';

export function getFloorPrice<
    F extends { value: number | string; payment_token: { decimals: number; symbol: string } },
>(floorPrices?: F[]) {
    const firstFloorPrice = first(floorPrices);
    if (!firstFloorPrice) return;

    return `${formatBalance(firstFloorPrice.value, firstFloorPrice.payment_token.decimals)} ${
        firstFloorPrice.payment_token.symbol
    }`;
}
