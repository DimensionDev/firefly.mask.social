import { getCoinInfo } from '@/mask/bindings/index.js';
import { useQuery } from '@tanstack/react-query';

export function useCoinInfo(coinId: string) {
    return useQuery({
        queryKey: ['coin-info', coinId],
        queryFn() {
            return getCoinInfo(coinId);
        },
    });
}
