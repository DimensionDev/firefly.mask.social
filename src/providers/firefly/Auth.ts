import urlcat from 'urlcat';
import type { Hex } from 'viem';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { Response } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

type GenerateFarcasterSignatureResponse = Response<{
    sponsorSignature: Hex;
    signedKeyRequestSignature: Hex;
    requestFid: number;
}>;

interface GenerateFarcasterSignaturesBody {
    key: Hex;
    deadline: number;
}

export async function generateFarcasterSignatures(
    body: GenerateFarcasterSignaturesBody,
    jwt: string,
    signal?: AbortSignal,
) {
    const response = await fetchJSON<GenerateFarcasterSignatureResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/v1/farcaster/generate-signatures'),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                authorization: `Bearer ${jwt}`,
            },
            signal,
        },
    );
    return resolveFireflyResponseData(response);
}
