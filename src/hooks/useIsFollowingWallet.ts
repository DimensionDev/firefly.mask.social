import { isSameAddress } from '@masknet/web3-shared-base';
import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { WalletsFollowStatusResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function useIsFollowingWallet(address: string, enabled = true) {
    return useQuery({
        enabled,
        queryKey: ['follow-wallet', address.toLowerCase()],
        queryFn: async () => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/follow/wallet');
            const res = await fireflySessionHolder.fetch<WalletsFollowStatusResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    addresses: [address],
                }),
            });
            if (!res.data) return false;
            return res.data.some((x) => x.is_followed && isSameAddress(x.address, address));
        },
    });
}
