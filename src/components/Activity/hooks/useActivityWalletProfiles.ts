import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import type { WalletProfileResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function useActivityWalletProfiles() {
    const { data: token } = useFireflyBridgeAuthorization();
    return useQuery({
        queryKey: ['activity-wallet-profile', token],
        async queryFn() {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile');
            const response = await fetchJSON<WalletProfileResponse>(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return resolveFireflyResponseData(response);
        },
        enabled: !!token,
    });
}
