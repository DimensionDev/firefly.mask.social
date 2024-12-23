import { useQuery } from '@tanstack/react-query';

import { OKX } from '@/providers/okx/index.js';

export function useOkxSupportedChains() {
    return useQuery({
        queryKey: ['okx-swap', 'supported-chains'],
        queryFn: async () => {
            const chains = await OKX.getSupportedChains();
            // use ethereum chains only
            return chains?.filter((x) => x.dexTokenApproveAddress);
        },
    });
}
