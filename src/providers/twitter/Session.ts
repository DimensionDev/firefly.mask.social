import { signOut } from 'next-auth/react';

import { BaseSession } from '@/providers/base/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { type Profile, SessionType } from '@/providers/types/SocialMedia.js';

export class TwitterSession extends BaseSession implements Session {
    constructor(
        // twitter handle
        profileId: string,
        token: string,
        createdAt: number,
        expiresAt: number,
    ) {
        super(SessionType.Twitter, profileId, token, createdAt, expiresAt);
    }

    override refresh(): Promise<void> {
        throw new Error('Not allowed');
    }

    override async destroy(): Promise<void> {
        signOut();
    }

    static from(profile: Profile) {
        return new TwitterSession(profile.profileId, '', Date.now(), Date.now());
    }
}
