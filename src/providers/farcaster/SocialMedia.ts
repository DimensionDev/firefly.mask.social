import urlcat from 'urlcat';
import { getWalletClient } from 'wagmi/actions';
import { fetchJSON } from '@/helpers/fetchJSON';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { Provider, Type } from '@/providers/types/SocialMedia';
import { Session } from '@/providers/types/Session';
import { FarcasterSession } from '@/providers/farcaster/Session';

const ROOT_URL = 'https://api.warpcast.com/v2';

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
        }>(urlcat(ROOT_URL, '/auth'), {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.errors?.length) throw new Error(response.errors[0].message);
        return FarcasterSession.from(response.result.token.secret, payload);
    }
}
