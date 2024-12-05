import { first } from 'lodash-es';
import urlcat from 'urlcat';
import type { GetWalletClientReturnType } from 'wagmi/actions';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { ErrorResponse, UserResponse } from '@/providers/types/Warpcast.js';

function getWarpcastErrorMessage(response: ErrorResponse) {
    if (Array.isArray(response.errors)) return first(response.errors)?.message;
    return;
}

/**
 * Create a session by signing the challenge with the custody wallet
 * @param signal
 * @returns
 */
export async function createAccountByCustodyWallet(
    client: Exclude<GetWalletClientReturnType, null>,
    signal?: AbortSignal,
) {
    const { payload, token } = await generateCustodyBearer(client);

    const authUrl = urlcat(WARPCAST_ROOT_URL, '/auth');
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

    const meUrl = urlcat(WARPCAST_ROOT_URL, '/me');
    const userResponse = await fetchJSON<UserResponse>(meUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${response.result.token.secret}`,
        },
    });

    const errorMessage = getWarpcastErrorMessage(userResponse);
    if (errorMessage) throw new Error(errorMessage);

    const session = new FarcasterSession(
        userResponse.result.user.fid.toString(),
        response.result.token.secret,
        payload.params.timestamp,
        payload.params.expiresAt,
    );
    const profile = await FarcasterSocialMediaProvider.getProfileById(userResponse.result.user.fid.toString());

    return {
        session,
        profile,
    };
}
