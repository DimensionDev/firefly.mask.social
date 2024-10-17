import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { WalletProfileResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function useIsLoginTwitterInActivity() {
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const { data: token } = useFireflyBridgeAuthorization();
    return useQuery({
        enabled: twitterProfile ? true : !!token,
        queryKey: ['is-logged-twitter', !!twitterProfile, token],
        async queryFn() {
            if (!fireflyBridgeProvider.supported) return !!twitterProfile;
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile');
            const res = await fetchJSON<WalletProfileResponse>(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.data) return false;
            return res.data.twitterProfiles.length > 0;
        },
    });
}
