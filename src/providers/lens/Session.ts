import { development, LensClient, production } from '@lens-protocol/client';
import { i18n } from '@lingui/core';
import { getWalletClient } from 'wagmi/actions';

import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { type Profile, Type } from '@/providers/types/SocialMedia.js';

export class LensSession extends BaseSession implements Session {
    constructor(
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
        public profile: Profile,
        public client = new LensClient({
            environment: process.env.NODE_ENV === 'production' ? production : development,
        }),
    ) {
        super(Type.Lens, profileId, token, createdAt, expiresAt);
        this.client = client;
    }

    override serialize(): `${Type}:${string}` {
        const body = JSON.stringify({
            profileId: this.profileId,
            token: this.token,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            profile: this.profile,
            client: this.client,
            type: this.type,
        });

        return `${this.type}:${body}`;
    }

    async refresh(): Promise<void> {
        const client = await getWalletClient();
        if (!client) throw new Error(i18n.t('No client found'));

        const { payload } = await generateCustodyBearer(client);

        const address = client.account.address;

        const profile = await this.client.profile.fetchDefault({
            for: address,
        });
        if (!profile) throw new Error(i18n.t('No profile found'));

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
        this.profile = formatLensProfile(profile);
    }

    async destroy(): Promise<void> {
        await this.client.authentication.logout();

        this.expiresAt = 0;
    }
}
