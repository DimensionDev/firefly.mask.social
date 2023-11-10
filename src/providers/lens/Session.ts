import { getWalletClient } from 'wagmi/actions';
import { Session } from '@/providers/types/Session';
import { BaseSession } from '@/providers/base/Session';
import { Type } from '@/providers/types/SocialMedia';
import { LensClient, development, production } from '@lens-protocol/client';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';

export class LensSession extends BaseSession implements Session {
    constructor(
        public profileId: string,
        public token: string,
        public createdAt: number,
        public expiresAt: number,
        private client = new LensClient({
            environment: process.env.NODE_ENV === 'production' ? production : development,
        }),
    ) {
        super(Type.Lens, profileId, token, createdAt, expiresAt);
    }

    async refresh(): Promise<void> {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload } = await generateCustodyBearer(client);

        const address = client.account.address;

        const profile = await this.client.profile.fetchDefault({
            for: address,
        });
        if (!profile) throw new Error('No profile found');

        const { id, text } = await this.client.authentication.generateChallenge({
            for: profile.id,
            signedBy: address,
        });

        const signature = await client.signMessage({
            message: text,
        });

        await this.client.authentication.authenticate({
            id,
            signature,
        });

        const accessTokenResult = await this.client.authentication.getAccessToken();
        const accessToken = accessTokenResult.unwrap();

        this.profileId = profile.id;
        this.token = accessToken;
        this.createdAt = payload.params.timestamp;
        this.expiresAt = payload.params.expiresAt;
    }

    async destroy(): Promise<void> {
        await this.client.authentication.logout();

        this.expiresAt = 0;
    }
}
