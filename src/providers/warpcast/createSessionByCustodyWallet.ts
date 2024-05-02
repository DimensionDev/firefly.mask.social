import { resolveCrossOriginURL } from '@masknet/web3-shared-base';
import urlcat from 'urlcat';
import type { GetWalletClientReturnType } from 'wagmi/actions';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';
import { getWarpcastErrorMessage } from '@/helpers/getWarpcastErrorMessage.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { UserResponse } from '@/providers/types/Warpcast.js';

/**
 * Create a session by signing the challenge with the custody wallet
 * @param signal
 * @returns
 */
export async function createSessionByCustodyWallet(
    client: Exclude<GetWalletClientReturnType, null>,
    signal?: AbortSignal,
) {
    const { payload, token } = await generateCustodyBearer(client);

    const authUrl = resolveCrossOriginURL(urlcat(WARPCAST_ROOT_URL, '/auth'));
    const response = await fetchJSON<{
        result: {
            token: {
                secret: string;
            };
        };
        errors?: Array<{ message: string; reason: string }>;
    }>(authUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (response.errors?.length) throw new Error(response.errors[0].message);

    const meUrl = resolveCrossOriginURL(urlcat(WARPCAST_ROOT_URL, '/me'));
    const userResponse = await fetchJSON<UserResponse>(meUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${response.result.token.secret}`,
        },
    });

    const errorMessage = getWarpcastErrorMessage(userResponse);
    if (errorMessage) throw new Error(errorMessage);

    return new FarcasterSession(
        userResponse.result.user.fid.toString(),
        response.result.token.secret,
        payload.params.timestamp,
        payload.params.expiresAt,
    );
}
