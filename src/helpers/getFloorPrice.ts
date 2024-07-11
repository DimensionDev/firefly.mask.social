import { first } from 'lodash-es';

import { formatBalance } from '@/helpers/formatBalance.js';

export function getFloorPrice<
    F extends { value: number | string; payment_token: { decimals: number; symbol: string } },
>(floorPrices?: F[]) {
    const firstFloorPrice = first(floorPrices);
    if (!firstFloorPrice) return;

    return `${formatBalance(firstFloorPrice.value, firstFloorPrice.payment_token.decimals, {
        isFixed: true,
    })} ${firstFloorPrice.payment_token.symbol}`;
}
