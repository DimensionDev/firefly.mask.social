import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { parseJSON } from '@masknet/web3-providers/helpers';
import z from 'zod';

import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { LensSession } from '@/providers/lens/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';

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
        const signerRequestToken = fragments[2] ?? '';

        const session = parseJSON<{
            type: SessionType;
            profileId: string;
            token: string;
            createdAt: number;
            expiresAt: number;
        }>(json);
        if (!session) throw new Error(t`Failed to parse session.`);

        const schema = z.object({
            profileId: z.string(),
            token: z.string(),
            createdAt: z.number().nonnegative(),
            expiresAt: z.number().nonnegative(),
        });

        const output = schema.safeParse(session);
        if (!output.success) {
            console.error([`[session factory] zod validation failure: ${output.error}`]);
            throw new Error(t`Malformed session.`);
        }

        const createSession = (type: SessionType): Session => {
            switch (type) {
                case SessionType.Lens:
                    return new LensSession(session.profileId, session.token, session.createdAt, session.expiresAt);
                case SessionType.Farcaster:
                    return new FarcasterSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        signerRequestToken,
                    );
                case SessionType.Twitter:
                    throw new Error(t`Not implemented yet.`);
                default:
                    safeUnreachable(type);
                    throw new Error(t`Unknown session type.`);
            }
        };

        return createSession(type) as T;
    }
}
