import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import urlcat from 'urlcat';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { Source } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { WalletProfileResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function useIsLoginTwitterInActivity() {
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const { data: token } = useFireflyBridgeAuthorization();
    const { setFireflyAccountId } = useContext(ActivityContext);
    return useQuery({
        queryKey: ['is-logged-twitter', !!twitterProfile, token],
        async queryFn() {
            if (!fireflyBridgeProvider.supported) return !!twitterProfile;
            if (!token) return false;
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile');
            const response = await fetchJSON<WalletProfileResponse>(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = resolveFireflyResponseData(response);
            if (data.fireflyAccountId) setFireflyAccountId(data.fireflyAccountId);
            return data.twitterProfiles.length > 0;
        },
    });
}