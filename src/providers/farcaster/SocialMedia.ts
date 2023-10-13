import urlcat from 'urlcat';
import { getWalletClient } from 'wagmi/actions';
import { MerkleAPIClient } from '@standard-crypto/farcaster-js';
import { fetchJSON } from '@/helpers/fetchJSON';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { WARPCAST_ROOT_URL } from '@/constants';
import { Provider, Type } from '@/providers/types/SocialMedia';
import { Session } from '@/providers/types/Session';
import { FarcasterSession } from '@/providers/farcaster/Session';

export class FarcasterSocialMedia implements Provider {
    get type() {
        return Type.Farcaster;
    }

    async createSession(): Promise<Session> {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload, token } = await generateCustodyBearer(client);
        const response = await fetchJSON<{
            result: {
                token: {
                    expiresAt: number;
                    secret: string;
                };
            };
            errors?: Array<{ message: string; reason: string }>;
        }>(urlcat(WARPCAST_ROOT_URL, '/auth'), {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (response.errors?.length) throw new Error(response.errors[0].message);

        return new FarcasterSession(response.result.token.secret, payload.params.timestamp, payload.params.expiresAt);
    }

    async createClient() {
        const session = await this.createSession();
        return new MerkleAPIClient({
            secret: session.token,
            expiresAt: session.expiresAt,
        });
    }
}
