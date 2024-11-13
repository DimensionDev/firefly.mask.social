import urlcat from 'urlcat';
import type { Hex } from 'viem';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { SignedKeyRequestResponse } from '@/providers/types/Warpcast.js';

interface SignedKeyRequestSponsorship {
    sponsorFid: number;
    signature: string; // sponsorship signature by sponsorFid
}

export interface SignedKeyRequestBody {
    key: Hex;
    requestFid: number;
    deadline: number;
    signature: Hex;
    redirectUrl?: string;
    sponsorship?: SignedKeyRequestSponsorship;
}

export async function signedKeyRequests(body: SignedKeyRequestBody, signal?: AbortSignal) {
    const url = urlcat(WARPCAST_ROOT_URL, '/signed-key-requests');
    return await fetchJSON<SignedKeyRequestResponse>(url, {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
    });
}
