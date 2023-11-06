import urlcat from 'urlcat';
import { WARPCAST_ROOT_URL } from '@/constants';
import { fetchJSON } from '@/helpers/fetchJSON';
import { Session } from '@/providers/types/Session';
import { BaseSession } from '@/providers/base/Session';
import { Type } from '@/providers/types/SocialMedia';
import { LensClient } from '@lens-protocol/client';
import { getWalletClient } from 'wagmi/actions';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';

export class LensSession extends BaseSession implements Session {
    constructor(
        public token: string,
        public profileId: string,
        public timestamp: number,
        public expiresAt: number,
        public lensClient: LensClient,
    ) {
        super(Type.Lens, profileId, token, timestamp, expiresAt);
    }

    async refresh(): Promise<void> {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload } = await generateCustodyBearer(client);

        const address = client.account.address;

        const profile = await this.lensClient.profile.fetchDefault({
            for: address,
        });

        const { id, text } = await this.lensClient.authentication.generateChallenge({
            for: profile?.id,
            signedBy: address,
        });

        const signature = await client.signMessage({
            message: text,
        });

        await this.lensClient.authentication.authenticate({
            id,
            signature,
        });

        const accessTokenResult = await this.lensClient.authentication.getAccessToken();
        const accessToken = accessTokenResult.unwrap();

        this.token = accessToken;
        this.timestamp = payload.params.timestamp;
        this.expiresAt = payload.params.expiresAt;
    }

    async destroy(): Promise<void> {
        await this.lensClient.authentication.logout();

        this.expiresAt = 0;
    }
}
