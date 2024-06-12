import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import z from 'zod';

import { UnreachableError } from '@/constants/error.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

const SessionSchema = z.object({
    profileId: z.string(),
    token: z.string(),
    createdAt: z.number().nonnegative(),
    expiresAt: z.number().nonnegative(),
});

const TwitterSessionPayloadSchema = z.object({
    clientId: z.string(),
    accessToken: z.string(),
    accessTokenSecret: z.string(),
    consumerKey: z.string(),
    consumerSecret: z.string(),
});

export class SessionFactory {
    /**
     * Creates a session instance based on the serialized session in string.
     *
     * @param serializedSession - The serialized session session in string.
     * @returns An instance of a session.
     */
    static createSession<T extends Session>(serializedSession: string): T {
        const fragments = serializedSession.split(':');
        const type = fragments[0] as SessionType;
        const json = atob(fragments[1]) as string;
        // for lens session, the second part is the refresh token
        // for farcaster session, the second part is the signer request token
        // for twitter session, the second part is payload in base64 encoded
        // for firefly session, the second part is the parent session in base64 encoded
        const secondPart = fragments[2] ?? '';
        // for farcaster session, the third part is the channel token
        const thirdPart = fragments[3] ?? '';

        const session = parseJSON<{
            type: SessionType;
            profileId: string;
            token: string;
            createdAt: number;
            expiresAt: number;
        }>(json);
        if (!session) throw new Error(t`Failed to parse session.`);

        const output = SessionSchema.safeParse(session);
        if (!output.success) {
            console.error([`[session factory] zod validation failure: ${output.error}`]);
            throw new Error(t`Malformed session.`);
        }

        const createSessionFor = (type: SessionType): Session => {
            switch (type) {
                case SessionType.Lens:
                    return new LensSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        secondPart,
                    );
                case SessionType.Farcaster:
                    return new FarcasterSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        secondPart,
                        thirdPart,
                    );
                case SessionType.Twitter:
                    const parsed = TwitterSessionPayloadSchema.safeParse(parseJSON(atob(secondPart)));
                    if (!parsed.success) throw new Error(t`Malformed twitter session payload.`);
                    return new TwitterSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        parsed.data,
                    );
                case SessionType.Firefly:
                    return new FireflySession(
                        session.profileId,
                        session.token,
                        secondPart ? SessionFactory.createSession(atob(secondPart)) : null,
                    );
                default:
                    safeUnreachable(type);
                    throw new UnreachableError('session type', type);
            }
        };

        return createSessionFor(type) as T;
    }
}
