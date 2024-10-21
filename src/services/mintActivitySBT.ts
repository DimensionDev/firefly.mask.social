import { t } from '@lingui/macro';
import urlcat from 'urlcat';

import { IS_IOS } from '@/constants/bowser.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Response } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export async function mintActivitySBT(
    address: string,
    activityType: string,
    {
        authToken,
    }: {
        authToken?: string;
    } = {},
) {
    let claimPlatform: 'web' | 'ios' | 'android' = 'web';
    if (fireflyBridgeProvider.supported) claimPlatform = IS_IOS ? 'ios' : 'android';
    const response = await fireflySessionHolder.fetch<
        Response<{
            status: boolean;
            hash: string;
            errormessage?: string;
        }>
    >(urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/activity/sbt'), {
        method: 'POST',
        body: JSON.stringify({
            walletAddress: address,
            claimPlatform,
            activityType,
        }),
        ...(authToken
            ? {
                  headers: {
                      Authorization: `Bearer ${authToken}`,
                  },
              }
            : {}),
    });
    if (response.error || !response.data) {
        throw new Error(response.error?.[0] ?? t`Failed to claim token`);
    }
    if (response.data.errormessage) {
        throw new Error(response.data.errormessage);
    }
    return response.data;
}
