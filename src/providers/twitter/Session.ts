/* cspell:disable */

import { signOut } from 'next-auth/react';

import { NotAllowedError } from '@/constants/error.js';
import { HIDDEN_SECRET } from '@/constants/index.js';
import { BaseSession } from '@/providers/base/Session.js';
import type { SessionPayload } from '@/providers/twitter/SessionPayload.js';
import type { Session } from '@/providers/types/Session.js';
import { type Profile, SessionType } from '@/providers/types/SocialMedia.js';

export class TwitterSession extends BaseSession implements Session {
    constructor(
        // twitter handle
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
        public payload: SessionPayload,
    ) {
        super(SessionType.Twitter, profileId, token, createdAt, expiresAt);
    }

    override refresh(): Promise<void> {
        throw new NotAllowedError();
    }

    override async destroy(): Promise<void> {
        signOut();
    }

    override serialize(): `${SessionType}:${string}` {
        return `${super.serialize()}:${btoa(JSON.stringify(this.payload))}`;
    }

    static from(profile: Profile, payload: SessionPayload) {
        const now = Date.now();
        return new TwitterSession(profile.profileId, '', now, now, payload);
    }

    static payloadFromHeaders(headers: Headers) {
        const clientId = headers.get('X-Client-Id') || '';
        const accessToken = headers.get('X-Access-Token') || '';
        const accessTokenSecret = headers.get('X-Access-Token-Secret') || '';
        const consumerKey = headers.get('X-Consumer-Key') || '';
        const consumerSecret = headers.get('X-Consumer-Secret') || '';
        if (!clientId || !accessToken || !accessTokenSecret || !consumerKey || !consumerSecret) return null;
        return {
            clientId,
            accessToken,
            accessTokenSecret,
            consumerKey,
            consumerSecret,
        };
    }

    static payloadToHeaders(payload: SessionPayload): Record<string, string> {
        return {
            'X-Client-Id': payload.clientId,
            'X-Access-Token': payload.accessToken,
            'X-Access-Token-Secret': payload.accessTokenSecret,
            'X-Consumer-Key': payload.consumerKey,
            'X-Consumer-Secret': payload.consumerSecret,
        };
    }

    static isNextAuth(session: Session | null) {
        if (!session) return false;
        // if the hidden secret used by the Twitter session payload
        // indicates that the session comes from the NextAuth service.
        return (
            session.type === SessionType.Twitter && (session as TwitterSession).payload.consumerSecret === HIDDEN_SECRET
        );
    }
}
