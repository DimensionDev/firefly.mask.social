import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { FireflyIdentity, WalletProfileResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export async function getAllPlatformProfileFromFirefly(identity: FireflyIdentity) {
    const queryKeyMap: { [key in Source]?: string } = {
        [Source.Lens]: 'lensHandle',
        [Source.Farcaster]: 'fid',
        [Source.Wallet]: 'walletAddress',
        [Source.Twitter]: 'twitterId',
    };
    const queryKey = queryKeyMap[identity.source] ?? '';

    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile', queryKey ? { [`${queryKey}`]: identity } : {});

    return fireflySessionHolder.fetch<WalletProfileResponse>(url, {
        method: 'GET',
    });
}
