import { useQuery } from '@tanstack/react-query';

// eslint-disable-next-line no-restricted-imports
import { getCoinInfo } from '@/maskbook/packages/web3-providers/src/CoinGecko/apis/base.js';

export function useCoinInfo(coinId: string) {
    return useQuery({
        queryKey: ['coin-info', coinId],
        queryFn() {
            return getCoinInfo(coinId);
        },
    });
}
