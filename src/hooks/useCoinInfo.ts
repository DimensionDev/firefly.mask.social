import { useQuery } from '@tanstack/react-query';

import { getCoinInfo } from '@/mask/bindings/index.js';

export function useCoinInfo(coinId: string) {
    return useQuery({
        queryKey: ['coin-info', coinId],
        queryFn() {
            return getCoinInfo(coinId);
        },
    });
}
