import { BigNumber } from 'bignumber.js';
import { first } from 'lodash-es';
import { useMemo } from 'react';

import { formatFloorPrice } from '@/helpers/formatFloorPrice.js';

export function useNFTFloorPrice<
    F extends { value: number | string; payment_token: { decimals: number; symbol: string } },
>(floorPrices?: F[]) {
    return useMemo(() => {
        const firstFloorPrice = first(floorPrices);
        if (!firstFloorPrice) return;
        return formatFloorPrice(
            BigNumber(firstFloorPrice.value).shiftedBy(-firstFloorPrice.payment_token.decimals).toNumber(),
        );
    }, [floorPrices]);
}
