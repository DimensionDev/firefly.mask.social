import { formatAmount } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import { useMemo } from 'react';

export function useNFTFloorPrice<
    F extends { value: number | string; payment_token: { decimals: number; symbol: string } },
>(floorPrices?: F[]) {
    return useMemo(() => {
        const firstFloorPrice = first(floorPrices);
        if (!firstFloorPrice) return;
        return `${formatAmount(firstFloorPrice.value, -firstFloorPrice.payment_token.decimals)} ${
            firstFloorPrice.payment_token.symbol
        }`;
    }, [floorPrices]);
}
