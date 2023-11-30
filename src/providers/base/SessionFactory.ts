import type { LensClient } from '@lens-protocol/client';
import { t } from '@lingui/macro';
import { parseJSON } from '@masknet/web3-providers/helpers';
import z from 'zod';

import { LensSession } from '@/providers/lens/Session.js';
import type { Session } from '@/providers/types/Session.js';
import { type Profile, Type } from '@/providers/types/SocialMedia.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';

export class SessionFactory {
    /**
     * Creates a session instance based on the serialized session in string.
     *
     * @param serializedSession - The serialized session session in string.
     * @returns An instance of a session.
     */
    public static createSession<T extends Session>(serializedSession: string): T {
        const colonIndex = serializedSession.indexOf(':');
        const type = serializedSession.substring(0, colonIndex) as Type;
        const json = serializedSession.substring(colonIndex + 1);

        const session = parseJSON<{
            type: Type;
            profileId: string;
            token: string;
            createdAt: number;
            expiresAt: number;
            privateKey?: string;
            profile?: Profile;
            client?: LensClient;
        }>(json);
        if (!session) throw new Error(t`Failed to parse session.`);
        if (session.type === Type.Lens && !session.profile) throw new Error(t`Missing profile.`);
        if (session.type === Type.Lens && !session.client) throw new Error(t`Missing client.`);

        const schema = z.object({
            profileId: z.string(),
            token: z.string(),
            createdAt: z.number().nonnegative(),
            expiresAt: z.number().nonnegative(),
        });

        const { success } = schema.safeParse(session);
        if (!success) throw new Error(t`Malformed session.`);

        const createSession = (type: Type): Session => {
            switch (type) {
                case Type.Lens:
                    return new LensSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        session.profile!,
                        session.client!,
                    );
                case Type.Warpcast:
                    return new WarpcastSession(
                        session.profileId,
                        session.token,
                        session.createdAt,
                        session.expiresAt,
                        session.privateKey!,
                    );
                case Type.Twitter:
                    throw new Error(t`Not implemented yet.`);
                default:
                    throw new Error(t`Unknown session type.`);
            }
        };

        return createSession(type) as T;
    }
}
